import type { PHP } from "@php-wasm/universal";

import type { Streams } from "libs/io";
import type { Context } from "libs/context";
import type { TestProgram } from "libs/testing";

export abstract class PHPTestProgram<I, O> implements TestProgram<I, O> {
  private result?: O;

  constructor(
    protected readonly streams: Streams,
    protected readonly php: PHP,
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

  async run(_: Context, input: I): Promise<O> {
    const code = this.transformCode(input);
    const response = await this.php.run({ code });
    const text = response.bytes;
    if (text.byteLength > 0) {
      this.streams.out.write(new Uint8Array(text));
    }
    if (response.errors) {
      throw new Error(response.errors);
    }
    if (this.result === undefined) {
      throw new Error("No result");
    }
    return this.result;
  }

  [Symbol.dispose]() {
    this.result = undefined;
    // TODO: Remove on message callback
  }
}
