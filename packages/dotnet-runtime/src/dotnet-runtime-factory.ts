import type { DotnetCompiler } from "./dotnet-compiler-factory";

export type DotnetRuntime = Omit<DotnetCompiler, "Compile">;

export class DotnetRuntimeFactory {
  constructor(protected readonly compiler: DotnetCompiler) {}

  create(...code: string[]): DotnetRuntime {
    const status = this.compiler.Compile(code);
    if (status !== 0) {
      throw new Error("Compilation failed");
    }
    return this.compiler;
  }
}
