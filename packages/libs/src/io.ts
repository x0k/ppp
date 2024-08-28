import { COLOR_ENCODED } from './logger.js';
import { isErr, type Result } from './result.js';

export interface Writer {
  write(data: Uint8Array): Result<number, number>;
}

export interface Reader {
  read(p: Uint8Array): Result<number, number>;
}

export function makeErrorWriter(out: Writer): Writer {
  return {
    write (data) {
      let r = out.write(COLOR_ENCODED.ERROR)
      if (isErr(r)) {
        return r
      }
      const r2 = out.write(data)
      if (isErr(r2)) {
        return r2
      }
      r = out.write(COLOR_ENCODED.RESET)
      if (isErr(r)) {
        return r
      }
      return r2
    },
  }
}
