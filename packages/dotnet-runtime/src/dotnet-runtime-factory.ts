import type { DotnetCompiler } from "./dotnet-compiler-factory";

export type DotnetRuntime = Omit<DotnetCompiler, "Compile">;

export class DotnetRuntimeFactory {
  constructor(protected readonly compiler: DotnetCompiler) {}

  async create(code: string, executionCode: string): Promise<DotnetCompiler> {
    const status = await this.compiler.Compile([code, executionCode]);
    if (status !== 0) {
      throw new Error("Compilation failed");
    }
    return this.compiler;
  }
}
