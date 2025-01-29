import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';

export interface Program {
  run: (ctx: Context) => Promise<void>;
}

export interface File {
  filename: string;
  content: string;
}

export interface Compiler<P> {
  compile: (ctx: Context, files: File[]) => Promise<P>;
}

export type CompilerFactory<P> = (ctx: Context, streams: Streams) => Promise<Compiler<P>>;
