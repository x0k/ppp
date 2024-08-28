import { createLogger, redirect } from "libs/logger";
import { isErr } from "libs/result";

import {
  LogLevel,
  type CompilerFactory,
  type GoCompilerFactory,
} from "./model";
import { makeErrorWriter } from 'libs/io';

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
      stderr: makeErrorWriter(out),
    });
    if (isErr(compiler)) {
      throw new Error(compiler.error);
    }
    return compiler.value;
  };
}
