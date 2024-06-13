import type { WebPHP } from "@php-wasm/web";
import type { Writer } from "libs/logger";
import type { Context } from "libs/context";

import type { TestRunner } from "../model";

export abstract class PHPTestRunner<I, O> implements TestRunner<I, O> {
  private result?: O;

  constructor(
    protected writer: Writer,
    protected readonly php: WebPHP,
    protected readonly code: string
  ) {
    php.onMessage(this.handleResult.bind(this));
  }

  protected caseExecutionCode(input: I): string {
    throw new Error("Not implemented");
  }

  protected transformCode(input: I) {
    return `${this.code}\npost_message_to_js(${this.caseExecutionCode(
      input
    )});`;
  }

  protected abstract transformResult(result: string): O;

  private handleResult(result: string) {
    this.result = this.transformResult(result);
  }

  async run(ctx: Context, input: I): Promise<O> {
    const code = this.transformCode(input);
    const clear = ctx.onCancel(() => this.php.exit(137));
    try {
      const response = await this.php.run({ code });
      const text = response.text;
      if (text) {
        this.writer.writeln(text);
      }
      if (response.errors) {
        throw new Error(response.errors);
      }
      if (this.result === undefined) {
        throw new Error("No result");
      }
      return this.result;
    } finally {
      clear();
    }
  }

  [Symbol.dispose](): void {
    this.php[Symbol.dispose]();
  }
}
