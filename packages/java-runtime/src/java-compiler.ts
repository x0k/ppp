import { Context, withCancel } from "libs/context";

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
    const [jvmCtx, cancel] = withCancel(ctx);
    const jvm = await this.jvmFactory(jvmCtx);
    return new Promise<void>((resolve, reject) => {
      jvm.runClass("util.Javac", [this.classPath], (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error("Compilation failed"));
        }
      });
    }).finally(cancel);
  }
}
