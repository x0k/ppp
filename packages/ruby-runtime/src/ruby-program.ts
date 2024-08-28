import { RubyVM } from "@ruby/wasm-wasi";
import type { Program } from "compiler";
import { inContext, type Context } from "libs/context";

export class RubyProgram implements Program {
  constructor(
    protected readonly code: string,
    protected readonly rubyVm: RubyVM
  ) {}

  async run(ctx: Context): Promise<void> {
    await inContext(ctx, this.rubyVm.evalAsync(this.code));
  }

  [Symbol.dispose](): void {}
}
