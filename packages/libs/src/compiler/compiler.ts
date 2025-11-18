import type { Context } from "libs/context";

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

export type CompilerFactory<O, P> = (
  ctx: Context,
  options: O
) => Promise<Compiler<P>>;
