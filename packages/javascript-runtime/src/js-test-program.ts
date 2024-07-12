import { inContext, type Context } from "libs/context";
import { patch } from "libs/patcher";

import type { TestProgram } from "testing";

export abstract class JsTestProgram<M, I, O> implements TestProgram<I, O> {

  constructor(
    protected readonly m: M,
    protected readonly patchedConsole: Console
  ) { }

  abstract executeTest(m: M, input: I): Promise<O>;

  async run(ctx: Context, input: I): Promise<O> {
    using _ = patch(globalThis, "console", this.patchedConsole);
    return await inContext(ctx, this.executeTest(this.m, input));
  }

  [Symbol.dispose](): void {}
}
