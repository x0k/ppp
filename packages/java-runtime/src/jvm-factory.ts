import BrowserFS from "browserfs";
import { type Context, inContext } from "libs/context";
import type { Streams } from "libs/io";
import { patch } from "libs/patcher";

import { createJVM, JVM } from "./jvm";
import { process } from "./process.js";

const { Buffer } = BrowserFS.BFSRequire("buffer");

export type JVMFactory = (ctx: Context) => Promise<JVM>;

export function makeJVMFactory(streams: Streams): JVMFactory {
  return async (ctx) => {
    const jvm = await inContext(
      ctx,
      createJVM({
        doppioHomePath: "/sys",
        classpath: ["/home", "/sys/classes"],
      })
    );
    const onStdout = (data: Uint8Array) => streams.out.write(data);
    const onStderr = (data: Uint8Array) => streams.err.write(data);
    // process.initializeTTYs();
    const disposableRead = patch(process.stdin, "read", () => {
      return Buffer.from(streams.in.read());
    });
    process.stdout.on("data", onStdout);
    process.stderr.on("data", onStderr);
    const disposable = ctx.onCancel(() => {
      disposable[Symbol.dispose]();
      jvm.halt(1);
      process.stdout.removeListener("data", onStdout);
      process.stderr.removeListener("data", onStderr);
      disposableRead[Symbol.dispose]();
    });
    return jvm;
  };
}
