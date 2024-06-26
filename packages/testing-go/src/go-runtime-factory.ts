import { createLogger, redirect, COLOR } from "libs/logger";
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
      stdout: {
        write(text) {
          out.write(text);
          return null;
        },
      },
      stderr: {
        write(text) {
          out.write(`${COLOR.ERROR}${text}${COLOR.RESET}`);
          return null;
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
