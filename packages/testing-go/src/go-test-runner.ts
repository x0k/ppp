import { type Context } from "libs/context";
import { isErr } from "libs/result";
import type { TestRunner } from "testing";

import type { Executor } from "./model";

export abstract class GoTestRunner<I, O> implements TestRunner<I, O> {
  constructor(protected readonly program: Executor<O>) {}

  protected generateCaseExecutionCode(input: I): string {
    throw new Error("Not implemented");
  }

  async run(ctx: Context, input: I): Promise<O> {
    const result = await this.program(
      ctx.signal,
      this.generateCaseExecutionCode(input)
    );
    if (isErr(result)) {
      throw new Error(result.error);
    }
    return result.value;
  }

  [Symbol.dispose](): void {
    throw new Error("Method not implemented.");
  }
}
