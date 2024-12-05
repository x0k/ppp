import type { DotnetCompiler } from "./dotnet-compiler-factory";

export type DotnetRuntime = Omit<DotnetCompiler, "Compile">;

export class DotnetRuntimeFactory {
  constructor(protected readonly compiler: DotnetCompiler) {}

  async create(...code: string[]): Promise<DotnetRuntime> {
    const status = await this.compiler.Compile(code);
    if (status !== 0) {
      throw new Error("Compilation failed");
    }
    return this.compiler;
  }
}
