import type { RubyVM, RbValue } from "@ruby/wasm-wasi";
import { inContext, type Context } from "libs/context";
import type { TestProgram } from "libs/testing";

export abstract class RubyTestProgram<I, O> implements TestProgram<I, O> {
  constructor(protected readonly rubyVm: RubyVM) {}

  async run(ctx: Context, input: I): Promise<O> {
    return this.transformResult(
      await inContext(ctx, this.rubyVm.evalAsync(this.caseExecutionCode(input)))
    );
  }

  protected abstract caseExecutionCode(input: I): string;

  protected transformResult(result: RbValue): O {
    return result.toJS();
  }
}
