import { CANCELED_ERROR, Context } from "libs/context";

import { FSModule } from "./fs";
import { JVMFactory } from "./jvm-factory";

export class JavaCompiler {
  constructor(
    protected readonly jvmFactory: JVMFactory,
    protected readonly classPath: string,
    protected readonly fs: FSModule
  ) {}

  async compile(ctx: Context, code: string) {
    this.fs.writeFileSync(this.classPath, code);
    const [jvm, dispose] = await this.jvmFactory(ctx);
    let disposable: Disposable | undefined;
    try {
      return await new Promise<void>((resolve, reject) => {
        disposable = ctx.onCancel(() => {
          jvm.halt(1);
          reject(CANCELED_ERROR);
        });
        jvm.runClass("util.Javac", [this.classPath], (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error("Compilation failed"));
          }
        });
      });
    } finally {
      disposable?.[Symbol.dispose]();
      dispose[Symbol.dispose]();
    }
  }
}
