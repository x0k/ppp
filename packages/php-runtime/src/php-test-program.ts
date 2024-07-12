import type { WebPHP } from "@php-wasm/web";

import type { Writer } from "libs/io";
import type { Context } from "libs/context";
import type { TestProgram } from "testing";

export abstract class PHPTestProgram<I, O> implements TestProgram<I, O> {
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
    return `${
      this.code
    }\npost_message_to_js(json_encode(${this.caseExecutionCode(input)}));`;
  }

  protected transformResult(result: string): O {
    return JSON.parse(result);
  }

  private handleResult(result: string) {
    this.result = this.transformResult(result);
  }

  async run(ctx: Context, input: I): Promise<O> {
    const code = this.transformCode(input);
    using _ = ctx.onCancel(() => this.php.exit(137));
    const response = await this.php.run({ code });
    const text = response.bytes;
    if (text.byteLength > 0) {
      this.writer.write(new Uint8Array(text));
    }
    if (response.errors) {
      throw new Error(response.errors);
    }
    if (this.result === undefined) {
      throw new Error("No result");
    }
    return this.result;
  }

  [Symbol.dispose](): void {
    this.php[Symbol.dispose]();
  }
}
