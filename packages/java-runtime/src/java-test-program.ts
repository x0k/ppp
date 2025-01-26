import type { Context } from "libs/context";
import type { TestProgram } from "testing";

import type { JVMFactory } from "./jvm-factory.js";

export abstract class JavaTestProgram<I, O> implements TestProgram<I, O> {
  constructor(
    protected readonly className: string,
    protected readonly jvmFactory: JVMFactory
  ) {}

  async run(ctx: Context, input: I): Promise<O> {
    const jvm = await this.jvmFactory(ctx);
    jvm.registerNatives({
      [this.className]: this.getNatives(input),
    });
    const code = await new Promise<number>((resolve) =>
      jvm.runClass(this.className, [], resolve)
    );
    if (code !== 0) {
      throw new Error("Run failed");
    }
    return this.getResult();
  }

  protected abstract getNatives(input: I): Record<string, Function>;
  protected abstract getResult(): O;
}
