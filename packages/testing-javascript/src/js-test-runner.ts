import { redirect, type Logger } from "libs/logger";
import { inContext, type Context } from "libs/context";
import { patch } from "libs/patcher";

import type { TestRunner } from "testing";

export abstract class JsTestRunner<M, I, O> implements TestRunner<I, O> {
  private readonly patchedConsole: Console;

  constructor(protected readonly logger: Logger, protected readonly m: M) {
    this.patchedConsole = redirect(globalThis.console, logger);
  }

  abstract executeTest(m: M, input: I): Promise<O>;

  async run(ctx: Context, input: I): Promise<O> {
    const recover = patch(globalThis, "console", this.patchedConsole);
    try {
      return inContext(ctx, this.executeTest(this.m, input));
    } finally {
      recover();
    }
  }

  [Symbol.dispose](): void {}
}
