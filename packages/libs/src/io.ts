import type { Result } from './result.js';

export interface Writer {
  write(data: Uint8Array): Result<number, number>;
}

export interface Reader {
  read(p: Uint8Array): Result<number, number>;
}
