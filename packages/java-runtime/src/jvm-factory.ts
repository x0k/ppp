import { Context, inContext } from "libs/context";
import { COLOR_ENCODED } from "libs/logger";
import { Writer } from "libs/io";

import { createJVM, JVM } from "./jvm";
import { process } from "./process.js";

export type JVMFactory = (ctx: Context) => Promise<[JVM, Disposable]>;

export function makeJVMFactory(writer: Writer): JVMFactory {
  return async (ctx) => {
    const jvm = await inContext(
      ctx,
      createJVM({
        doppioHomePath: "/sys",
        classpath: ["/home", "/sys/classes"],
      })
    );
    const onStdout = (data: Uint8Array) => writer.write(data);
    const onStderr = (data: Uint8Array) => {
      writer.write(COLOR_ENCODED.ERROR);
      writer.write(data);
      writer.write(COLOR_ENCODED.RESET);
    };
    // process.initializeTTYs();
    process.stdout.on("data", onStdout);
    process.stderr.on("data", onStderr);
    return [
      jvm,
      {
        [Symbol.dispose]: () => {
          process.stdout.removeListener("data", onStdout);
          process.stderr.removeListener("data", onStderr);
        },
      },
    ];
  };
}
