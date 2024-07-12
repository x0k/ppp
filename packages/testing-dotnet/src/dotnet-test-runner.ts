import type { Context } from "libs/context";
import { patch } from "libs/patcher";
import type { TestRunner } from "testing";

import type { DotnetRuntime } from "./dotnet-runtime-factory";

export class DotnetTestRunner<I, O> implements TestRunner<I, O> {
  constructor(
    protected readonly typeFullName: string,
    protected readonly methodName: string,
    protected readonly runtime: DotnetRuntime,
    protected readonly patchedConsole: Console
  ) {}

  async run(_: Context, input: I): Promise<O> {
    const recover = patch(globalThis, "console", this.patchedConsole);
    try {
      const status = this.runtime.Run(
        this.typeFullName,
        this.methodName,
        this.convertToArgs(input)
      );
      if (status !== 0) {
        throw new Error("Run failed");
      }
      return this.getResult();
    } finally {
      recover();
    }
  }

  [Symbol.dispose](): void {
    this.runtime.DisposeAssembly();
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
