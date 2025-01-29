import { createLogger, redirect } from "libs/logger";
import { isErr } from "libs/result";

import {
  LogLevel,
  type CompilerFactory,
  type GoCompilerFactory,
} from "./model";

export function makeGoCompilerFactory(
  makeCompiler: CompilerFactory
): GoCompilerFactory {
  return (streams) => {
    const compiler = makeCompiler({
      logger: {
        level: LogLevel.Info,
        console: redirect(globalThis.console, createLogger(streams.out)),
      },
      stdin: streams.in,
      stdout: streams.out,
      stderr: streams.err,
    });
    if (isErr(compiler)) {
      throw new Error(compiler.error);
    }
    return compiler.value;
  };
}
