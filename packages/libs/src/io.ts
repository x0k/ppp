export interface Writer {
  write(data: Uint8Array): void
}

export interface Reader {
  read(): Uint8Array;
  onData(handler: (data: Uint8Array) => void): Disposable
}

export interface Streams {
  in: Reader
  out: Writer
  err: Writer
}
