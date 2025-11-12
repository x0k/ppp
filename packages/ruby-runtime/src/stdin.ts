import { Fd, Inode, wasi } from "@bjorn3/browser_wasi_shim";

export class Stdin extends Fd {
  private ino: bigint;
  buffer: Uint8Array<ArrayBufferLike> = new Uint8Array();
  read: () => Uint8Array;

  constructor(read: () => Uint8Array) {
    super();
    this.ino = Inode.issue_ino()
    this.read = read;
  }

  override fd_filestat_get(): { ret: number; filestat: wasi.Filestat } {
    const filestat = new wasi.Filestat(
      this.ino,
      wasi.FILETYPE_CHARACTER_DEVICE,
      BigInt(0)
    );
    return { ret: 0, filestat };
  }

  override fd_fdstat_get(): { ret: number; fdstat: wasi.Fdstat | null } {
    const fdstat = new wasi.Fdstat(wasi.FILETYPE_CHARACTER_DEVICE, 0);
    fdstat.fs_rights_base = BigInt(wasi.RIGHTS_FD_READ);
    return { ret: 0, fdstat };
  }

  override fd_read(size: number): { ret: number; data: Uint8Array } {
    const data = this.read_data(size);
    return { ret: 0, data };
  }

  protected read_data(size: number) {
    const bl = this.buffer.length;
    if (bl >= size) {
      const data = this.buffer.subarray(0, size);
      this.buffer = this.buffer.subarray(size);
      return data;
    }
    const input = this.read();
    let next: Uint8Array;
    if (bl === 0) {
      if (input.length <= size) {
        return input;
      }
      next = input;
    } else {
      next = new Uint8Array(bl + input.length);
      next.set(this.buffer);
      next.set(input, bl);
      if (next.length < size) {
        this.buffer = this.buffer.subarray(0, 0);
        return next;
      }
    }
    const data = next.subarray(0, size);
    this.buffer = next.subarray(size);
    return data;
  }
}
