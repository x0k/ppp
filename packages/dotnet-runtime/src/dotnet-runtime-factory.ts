import type { DotnetCompiler } from "./dotnet-compiler-factory";

export type DotnetRuntime = Omit<DotnetCompiler, "Compile">;

export class DotnetRuntimeFactory {
  constructor(protected readonly compiler: DotnetCompiler) {}

  create(code: string, executionCode: string): DotnetCompiler {
    const status = this.compiler.Compile([code, executionCode]);
    if (status !== 0) {
      throw new Error("Compilation failed");
    }
    return this.compiler;
  }
}
