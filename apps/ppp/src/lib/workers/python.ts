import type { Context } from "libs/context";
import { createLogger, type Logger } from "libs/logger";
import { PyTestRunner, pyRuntimeFactory } from "testing-python";
import { startTestRunnerActor } from "testing/actor";

// @ts-ignore
import wasmUrl from "testing-python/pyodide.wasm";
// @ts-ignore
import stdlibUrl from "testing-python/python-stdlib.zip";

export interface UniversalFactoryData {
  createLogger: typeof createLogger;
  PyTestRunner: typeof PyTestRunner;
  pyRuntimeFactory: (
    ctx: Context,
    log: Logger
  ) => ReturnType<typeof pyRuntimeFactory>;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData>(
  (universalFactory) =>
    universalFactory({
      PyTestRunner,
      createLogger,
      pyRuntimeFactory: (ctx, log) =>
        pyRuntimeFactory(
          ctx,
          log,
          (imports) =>
            WebAssembly.instantiateStreaming(fetch(wasmUrl), imports),
          stdlibUrl
        ),
    })
);
