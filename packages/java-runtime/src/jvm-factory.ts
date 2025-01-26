import { type Context, inContext } from "libs/context";
import type { Writer } from "libs/io";

import { createJVM, JVM } from "./jvm";
import { process } from "./process.js";

export type JVMFactory = (ctx: Context) => Promise<JVM>;

export function makeJVMFactory(stdout: Writer, stderr: Writer): JVMFactory {
  return async (ctx) => {
    const jvm = await inContext(
      ctx,
      createJVM({
        doppioHomePath: "/sys",
        classpath: ["/home", "/sys/classes"],
      })
    );
    const onStdout = (data: Uint8Array) => stdout.write(data);
    const onStderr = (data: Uint8Array) => stderr.write(data);
    // process.initializeTTYs();
    process.stdout.on("data", onStdout);
    process.stderr.on("data", onStderr);
    const disposable = ctx.onCancel(() => {
      disposable[Symbol.dispose]();
      jvm.halt(1);
      process.stdout.removeListener("data", onStdout);
      process.stderr.removeListener("data", onStderr);
    });
    return jvm;
  };
}
