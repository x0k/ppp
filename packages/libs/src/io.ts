export interface Writer {
  write(data: Uint8Array): void
}

export interface Reader {
  read(): Uint8Array;
}

export interface Streams {
  in: Reader
  out: Writer
  err: Writer
}
