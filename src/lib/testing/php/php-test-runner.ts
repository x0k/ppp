import type { WebPHP } from "@php-wasm/web";

import type { TestRunner } from "../model";

export abstract class PHPTestRunner<I, O> implements TestRunner<I, O> {
  private result?: O;

  constructor(protected readonly php: WebPHP, protected readonly code: string) {
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

  async run(input: I): Promise<O> {
    const code = this.transformCode(input);
    const response = await this.php.run({ code });
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
