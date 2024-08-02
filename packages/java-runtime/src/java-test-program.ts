import { Context } from "libs/context";
import type { TestProgram } from "testing";

import { JVM } from "./jvm";

export type JVMFactory = (ctx: Context) => Promise<[JVM, Disposable]>;

export class JavaTestProgram<I, O> implements TestProgram<I, O> {
  constructor(
    protected readonly className: string,
    protected readonly jvmFactory: JVMFactory
  ) {}

  async run(ctx: Context, input: I): Promise<O> {
    const [jvm, jvmDispose] = await this.jvmFactory(ctx);
    const dispose = ctx.onCancel(() => jvm.halt(1));
    try {
      const code = await new Promise<number>((resolve) =>
        jvm.runClass(this.className, this.convertToArgs(input), resolve)
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

  protected convertToArgs(input: I): string[] {
    return [JSON.stringify(input)];
  }

  protected getResult(): O {
    throw new Error("Not implemented");
  }
}
