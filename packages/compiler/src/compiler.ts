import type { Context } from 'libs/context';
import type { Writer } from 'libs/io';

export interface Program extends Disposable {
  run: (ctx: Context) => Promise<void>;
}

export interface File {
  filename: string;
  content: string;
}

export interface Compiler extends Disposable {
  compile: (ctx: Context, files: File[]) => Promise<Program>;
}

export type CompilerFactory = (ctx: Context, out: Writer) => Promise<Compiler>;
