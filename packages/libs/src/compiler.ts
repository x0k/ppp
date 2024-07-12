import type { Context } from './context.js';

export interface Program {
  run: (ctx: Context) => Promise<void>;
}

export interface File {
  filename: string;
  content: string;
}

export interface Compiler {
  compile: (ctx: Context, files: File[]) => Promise<Program>;
}
