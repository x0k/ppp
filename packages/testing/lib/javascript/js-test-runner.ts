import { redirect, type Logger } from "libs/logger";
import { inContext, type Context } from "libs/context";
import { patch } from "libs/patcher";

import type { TestRunner } from "../model";

export abstract class JsTestRunner<M, I, O> implements TestRunner<I, O> {
  private readonly patchedConsole: Console;
  constructor(
    protected readonly logger: Logger,
    protected readonly code: string
  ) {
    this.patchedConsole = redirect(globalThis.console, logger);
  }

  protected transformCode(code: string) {
    return `data:text/javascript;base64,${btoa(code)}`;
  }

  abstract executeTest(m: M, input: I): Promise<O>;

  async run(ctx: Context, input: I): Promise<O> {
    const transformedCode = this.transformCode(this.code);
    const recover = patch(globalThis, "console", this.patchedConsole);
    try {
      const m = await inContext(
        ctx,
        import(/* @vite-ignore */ transformedCode)
      );
      return this.executeTest(m, input);
    } finally {
      recover();
    }
  }

  [Symbol.dispose](): void {}
}
