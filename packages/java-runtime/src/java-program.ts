import { Program } from "compiler";
import { Context } from "libs/context";

import { JVMFactory } from "./jvm-factory";

export class JavaProgram implements Program {
  constructor(
    protected readonly className: string,
    protected readonly jvmFactory: JVMFactory
  ) {}

  async run(ctx: Context): Promise<void> {
    const jvm = await this.jvmFactory(ctx);
    const stopJVM = () => {
      jvm.halt(1)
    }
    ctx.signal.addEventListener('abort', stopJVM)
    try {
      const code = await new Promise<number>((resolve) =>
        jvm.runClass(this.className, [], resolve)
      );
      if (code !== 0) {
        throw new Error("Run failed");
      }
    } finally {
      ctx.signal.removeEventListener('abort', stopJVM)
    }
  }

  [Symbol.dispose](): void {}
}
