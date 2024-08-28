import type { RubyVM, RbValue } from "@ruby/wasm-wasi";
import { inContext, type Context } from "libs/context";
import type { TestProgram } from "testing";

export abstract class RubyTestProgram<I, O> implements TestProgram<I, O> {
  constructor(
    protected readonly code: string,
    protected readonly rubyVm: RubyVM
  ) {}

  async run(ctx: Context, input: I): Promise<O> {
    return this.transformResult(
      await inContext(ctx, this.rubyVm.evalAsync(this.transformCode(input)))
    );
  }

  [Symbol.dispose](): void {}

  protected transformCode(input: I): string {
    return `${this.code}\n${this.caseExecutionCode(input)}`;
  }

  protected abstract caseExecutionCode(input: I): string;

  protected transformResult(result: RbValue): O {
    return result.toJS();
  }
}
