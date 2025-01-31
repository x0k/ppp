import type { Context } from "libs/context";
import type { TestProgram } from "libs/testing";

import type { DotnetRuntime } from "./dotnet-runtime-factory";

export class DotnetTestProgram<I, O> implements TestProgram<I, O> {
  constructor(
    protected readonly typeFullName: string,
    protected readonly methodName: string,
    protected readonly runtime: DotnetRuntime
  ) {}

  async run(_: Context, input: I): Promise<O> {
    const status = this.runtime.Run(
      this.typeFullName,
      this.methodName,
      this.convertToArgs(input)
    );
    if (status !== 0) {
      throw new Error("Run failed");
    }
    return this.getResult();
  }

  protected convertToArgs(input: I): string[] {
    return [JSON.stringify(input)];
  }

  protected getResult(): O {
    const result = this.runtime.GetResultAsString();
    if (result === null) {
      throw new Error("GetResultAsString failed");
    }
    return JSON.parse(result);
  }
}
