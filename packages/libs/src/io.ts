import { COLOR_ENCODED } from './logger.js';

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

export function makeErrorWriter(out: Writer): Writer {
  return {
    write (data) {
      out.write(COLOR_ENCODED.ERROR)
      out.write(data)
      out.write(COLOR_ENCODED.RESET)
    },
  }
}
