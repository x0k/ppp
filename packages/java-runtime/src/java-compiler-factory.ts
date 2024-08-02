import { inContext } from "libs/context";
import { COLOR_ENCODED } from "libs/logger";
import { Writer } from "libs/io";

import { createJVM } from "./jvm";
import { JVMFactory } from "./java-test-program.js";

export class JavaCompilerFactory {
  constructor(
    protected readonly writer: Writer,
    protected readonly process: NodeJS.Process
  ) {}

  async create(): Promise<JVMFactory> {
    return async (ctx) => {
      const jvm = await inContext(
        ctx,
        createJVM({
          doppioHomePath: "/sys",
          classpath: ["/home", "/sys/classes"],
        })
      );
      const onStdout = (data: Uint8Array) => this.writer.write(data);
      const onStderr = (data: Uint8Array) => {
        this.process.stderr.write(COLOR_ENCODED.ERROR);
        this.writer.write(data);
        this.process.stderr.write(COLOR_ENCODED.RESET);
      };
      this.process.stdout.on("data", onStdout);
      this.process.stderr.on("data", onStderr);
      return [
        jvm,
        {
          [Symbol.dispose]: () => {
            this.process.stdout.removeListener("data", onStdout);
            this.process.stderr.removeListener("data", onStderr);
          },
        },
      ];
    };
  }
}
