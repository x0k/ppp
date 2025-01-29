export class SharedQueue {
  protected encoder = new TextEncoder();
  protected decoder = new TextDecoder();
  /** @private */
  public index = 0;
  /** @private */
  public lastIndex = 0;

  protected len: number;
  protected byteArr: Uint8Array;
  protected uintArr: Uint32Array;
  protected intArr: Int32Array;
  protected floatArr: Float32Array;

  constructor(buffer: ArrayBuffer | SharedArrayBuffer) {
    this.byteArr = new Uint8Array(buffer);
    this.uintArr = new Uint32Array(buffer);
    this.intArr = new Int32Array(buffer);
    this.floatArr = new Float32Array(buffer);
    this.len = this.uintArr.length;
  }

  pushUint(element: number) {
    this.uintArr[this.nextIndex()] = element;
  }

  pushInt(element: number) {
    this.intArr[this.nextIndex()] = element;
  }

  pushFloat(element: number) {
    this.floatArr[this.nextIndex()] = element;
  }

  pushBytes(bytes: Uint8Array | Uint8ClampedArray) {
    // TODO: push operations should consider the last index (free space)
    if (this.byteArr.length < bytes.length + 12) {
      // commit + len + padding
      throw new Error(`Too large`);
    }
    this.pushUint(bytes.length);
    const offset = (this.index + 1) * 4;
    const diff = this.byteArr.length - offset;
    if (bytes.length <= diff) {
      this.byteArr.set(bytes, offset);
      this.index += Math.ceil(bytes.length / 4);
    } else {
      this.byteArr.set(bytes.subarray(0, diff), offset);
      this.byteArr.set(bytes.subarray(diff), 0);
      this.index = Math.ceil((bytes.length - diff) / 4) - 1;
    }
  }

  pushString(str: string) {
    const encoded = this.encoder.encode(str);
    this.pushBytes(encoded);
  }

  commit() {
    if (this.lastIndex === this.index) {
      return;
    }
    this.nextIndex();
    this.intArr[this.index] = this.index;
    Atomics.store(this.intArr, this.lastIndex, this.index);
    Atomics.notify(this.intArr, this.lastIndex);
    this.lastIndex = this.index;
  }

  get float() {
    return this.floatArr[this.lastIndex];
  }

  get int() {
    return this.intArr[this.lastIndex];
  }

  get uint() {
    return this.uintArr[this.lastIndex];
  }

  get bytes() {
    const len = this.uintArr[this.lastIndex];
    const bytes = new Uint8Array(len);
    const offset = (this.lastIndex + 1) * 4;
    const diff = this.byteArr.length - offset;
    if (len <= diff) {
      bytes.set(this.byteArr.subarray(offset, offset + len), 0);
      this.lastIndex += Math.ceil(len / 4);
    } else {
      bytes.set(this.byteArr.subarray(offset, offset + diff), 0);
      bytes.set(this.byteArr.subarray(0, len - diff), diff);
      this.lastIndex = Math.ceil((len - diff) / 4) - 1;
    }
    return bytes;
  }

  get string() {
    return this.decoder.decode(this.bytes);
  }

  get blob() {
    return new Blob([this.bytes]);
  }

  pop(handle: (queue: SharedQueue) => void) {
    if (this.isActual()) {
      return;
    }
    this.popData(handle);
  }

  *read() {
    if (this.isActual()) {
      return this;
    }
    yield* this.readData();
    return this;
  }

  blockingPop(handler: (queue: SharedQueue) => void) {
    this.waitForNewData();
    this.popData(handler);
  }

  blockingRead() {
    this.waitForNewData();
    return this.readData();
  }

  protected nextIndex() {
    return (this.index = (this.index + 1) % this.len);
  }

  protected nextLastIndex() {
    return (this.lastIndex = (this.lastIndex + 1) % this.len);
  }

  protected isActual() {
    this.index = Atomics.load(this.uintArr, this.lastIndex);
    return this.index === this.lastIndex;
  }

  protected waitForNewData() {
    Atomics.wait(this.intArr, this.lastIndex, this.index);
    this.index = this.intArr[this.lastIndex];
  }

  protected popData(handler: (queue: SharedQueue) => void) {
    while (this.index !== this.nextLastIndex()) {
      handler(this);
    }
  }

  protected *readData() {
    while (this.index !== this.nextLastIndex()) {
      yield this;
    }
    return this;
  }
}
