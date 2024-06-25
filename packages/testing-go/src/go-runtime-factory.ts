import type { Context } from "libs/context";
import { redirect, type Logger } from "libs/logger";
import { isErr } from "libs/result";

import wasmUrl from "../assets/compiler.wasm?url";

import { createCompilerFactory } from "./go-compiler-factory";
import { LogLevel } from "./model";
import { goExecutorFactory } from "./go-executor-factory";

export async function goRuntimeFactory<O>(
  ctx: Context,
  log: Logger,
  code: string
) {
  const makeCompiler = await createCompilerFactory(
    async (imports) =>
      (
        await WebAssembly.instantiateStreaming(
          fetch(wasmUrl, { signal: ctx.signal }),
          imports
        )
      ).instance
  );
  const compiler = makeCompiler({
    logger: {
      level: LogLevel.Info,
      console: redirect(globalThis.console, log),
    },
    stdout: {
      write(text) {
        log.debug(text);
        return null;
      },
    },
    stderr: {
      write(text) {
        log.error(text);
        return null;
      },
    },
  });
  if (isErr(compiler)) {
    throw new Error(compiler.error);
  }
  return goExecutorFactory<O>(ctx, compiler.value, code);
}
