export interface Writer {
  write(data: Uint8Array): void;
}

export interface Reader {
  read(): Uint8Array;
}

export interface Streams {
  in: Reader;
  out: Writer;
  err: Writer;
}

export type ReadableStreamOfBytes = ReadableStream<Uint8Array>;

export type WritableStreamOfBytes = WritableStream<Uint8Array>;

export type BytesStreamWriter = WritableStreamDefaultWriter<
  Uint8Array<ArrayBufferLike>
>;
