import { createLogger, redirect } from "libs/logger";
import { isErr } from "libs/result";
import { makeErrorWriter } from 'libs/io';

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
      stderr: makeErrorWriter(out),
    });
    if (isErr(compiler)) {
      throw new Error(compiler.error);
    }
    return compiler.value;
  };
}
