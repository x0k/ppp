import type { Context } from "libs/context";
import type { TestProgram } from "testing";

import type { DotnetRuntime } from "./dotnet-runtime-factory";

export class DotnetTestProgram<I, O> implements TestProgram<I, O> {
  constructor(
    protected readonly typeFullName: string,
    protected readonly methodName: string,
    protected readonly runtime: DotnetRuntime
  ) {}

  async run(_: Context, input: I): Promise<O> {
    const status = await this.runtime.Run(
      this.typeFullName,
      this.methodName,
      this.convertToArgs(input)
    );
    if (status !== 0) {
      throw new Error("Run failed");
    }
    return this.getResult();
  }

  [Symbol.dispose](): void {
    this.runtime.DisposeAssembly();
  }

  protected convertToArgs(input: I): string[] {
    return [JSON.stringify(input)];
  }

  protected async getResult(): Promise<O> {
    const result = await this.runtime.GetResultAsString();
    if (result === null) {
      throw new Error("GetResultAsString failed");
    }
    return JSON.parse(result);
  }
}
