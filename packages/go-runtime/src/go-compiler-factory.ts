import { COLOR_ENCODED, createLogger, redirect } from "libs/logger";
import { isErr } from "libs/result";

import {
  LogLevel,
  type CompilerFactory,
  type GoCompilerFactory,
} from "./model";

export function makeGoCompilerFactory(
  makeCompiler: CompilerFactory
): GoCompilerFactory {
  return (out) => {
    const compiler = makeCompiler({
      logger: {
        level: LogLevel.Info,
        console: redirect(globalThis.console, createLogger(out)),
      },
      stdout: out,
      stderr: {
        write(text) {
          let r = out.write(COLOR_ENCODED.ERROR);
          if (isErr(r)) {
            return r;
          }
          const r2 = out.write(text);
          if (isErr(r2)) {
            return r2;
          }
          r = out.write(COLOR_ENCODED.RESET);
          if (isErr(r)) {
            return r;
          }
          return r2;
        },
      },
    });
    if (isErr(compiler)) {
      throw new Error(compiler.error);
    }
    return compiler.value;
  };
}
