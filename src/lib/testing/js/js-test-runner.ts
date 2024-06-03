import type { TestRunner } from "../testing";

export abstract class JsTestRunner<M, I, O> implements TestRunner<I, O> {
  constructor(protected readonly code: string) {}

  protected transformCode(code: string) {
    return `data:text/javascript;base64,${btoa(code)}`;
  }

  abstract executeTest(m: M, input: I): Promise<O>;

  async run(input: I): Promise<O> {
    const transformedCode = this.transformCode(this.code);
    const m = await import(transformedCode);
    return this.executeTest(m, input);
  }

  [Symbol.dispose](): void {}
}
