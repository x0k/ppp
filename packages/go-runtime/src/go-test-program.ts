import { type Context } from "libs/context";
import { isErr } from "libs/result";
import type { TestProgram } from "testing";

import type { Evaluator } from "./model";

export abstract class GoTestProgram<I, O> implements TestProgram<I, O> {
  constructor(protected readonly program: Evaluator<O>) {}

  abstract generateCaseExecutionCode(input: I): string

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

  [Symbol.dispose](): void {}
}
