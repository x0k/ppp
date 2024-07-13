import { createLogger, redirect, COLOR_ENCODED } from "libs/logger";
import { isErr } from "libs/result";

import { LogLevel, type CompilerFactory, type GoRuntimeFactory } from "./model";

export function makeGoRuntimeFactory<O>(
  makeCompiler: CompilerFactory
): GoRuntimeFactory<O> {
  return async (ctx, out, code) => {
    const compiler = makeCompiler({
      logger: {
        level: LogLevel.Info,
        console: redirect(globalThis.console, createLogger(out)),
      },
      stdout: out,
      stderr: {
        write(text) {
          let r = out.write(COLOR_ENCODED.ERROR)
          if (isErr(r)) {
            return r
          }
          const r2 = out.write(text);
          if (isErr(r2)) {
            return r2
          }
          r = out.write(COLOR_ENCODED.RESET)
          if (isErr(r)) {
            return r
          }
          return r2
        },
      },
    });
    if (isErr(compiler)) {
      throw new Error(compiler.error);
    }
    const executor = await compiler.value.compile<O>(ctx.signal, code);
    if (isErr(executor)) {
      throw new Error(executor.error);
    }
    return executor.value;
  };
}
