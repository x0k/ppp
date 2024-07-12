import { type Context } from "libs/context";
import { isErr } from "libs/result";
import type { TestProgram } from "testing";

import type { Executor } from "./model";

export abstract class GoTestProgram<I, O> implements TestProgram<I, O> {
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
