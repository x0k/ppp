import type { Context } from 'libs/context';

import type { DotnetCompiler } from "./dotnet-compiler-factory";

export type DotnetRuntime = Omit<DotnetCompiler, "Compile" | "DisposeAssembly">;

export class DotnetRuntimeFactory {
  constructor(protected readonly compiler: DotnetCompiler) {}

  create(ctx: Context, ...code: string[]): DotnetRuntime {
    ctx.onCancel(() => {
      this.compiler.DisposeAssembly()
    })
    const status = this.compiler.Compile(code);
    if (status !== 0) {
      throw new Error("Compilation failed");
    }
    return this.compiler;
  }
}
