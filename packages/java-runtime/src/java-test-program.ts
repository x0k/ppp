import type { Context } from "libs/context";
import type { TestProgram } from "testing";

import type { JVMFactory } from './jvm-factory.js';

export abstract class JavaTestProgram<I, O> implements TestProgram<I, O> {
  constructor(
    protected readonly className: string,
    protected readonly jvmFactory: JVMFactory
  ) {}

  async run(ctx: Context, input: I): Promise<O> {
    const [jvm, jvmDispose] = await this.jvmFactory(ctx);
    const dispose = ctx.onCancel(() => jvm.halt(1));
    try {
      jvm.registerNatives({
        [this.className]: this.getNatives(input),
      });
      const code = await new Promise<number>((resolve) =>
        jvm.runClass(this.className, [], resolve)
      );
      if (code !== 0) {
        throw new Error("Run failed");
      }
    } finally {
      dispose[Symbol.dispose]();
      jvmDispose[Symbol.dispose]();
    }
    return this.getResult();
  }

  [Symbol.dispose](): void {}

  protected abstract getNatives(input: I): Record<string, Function>;
  protected abstract getResult(): O;
}
