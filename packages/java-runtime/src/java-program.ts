import { Program } from "libs/compiler";
import { Context } from "libs/context";

import { JVMFactory } from "./jvm-factory";

export class JavaProgram implements Program {
  constructor(
    protected readonly className: string,
    protected readonly jvmFactory: JVMFactory
  ) {}

  async run(ctx: Context): Promise<void> {
    const [jvm, jvmDispose] = await this.jvmFactory(ctx);
    const dispose = ctx.onCancel(() => jvm.halt(1));
    try {
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
  }

  [Symbol.dispose](): void {}
}
