import type { Context } from "libs/context";
import { createLogger, type Logger } from "libs/logger";
import type { TestRunnerFactory } from "testing";
import { PyTestRunner, pyRuntimeFactory } from "testing-python";
import { startTestRunnerActor } from "testing/actor";

// @ts-ignore
import wasmUrl from "testing-python/pyodide.wasm";
// @ts-ignore
import stdlibUrl from "testing-python/python-stdlib.zip";

export interface UniversalFactoryData<I, O> {
  createLogger: typeof createLogger;
  PyTestRunner: typeof PyTestRunner;
  pyRuntimeFactory: (
    ctx: Context,
    log: Logger
  ) => ReturnType<typeof pyRuntimeFactory>;
  makeTestRunnerFactory: (
    generateCaseExecutionCode: (input: I) => string
  ) => TestRunnerFactory<I, O>;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData<unknown, unknown>>(
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
      makeTestRunnerFactory: (generateCaseExecutionCode) => {
        class TestRunner extends PyTestRunner<unknown, unknown> {
          protected override caseExecutionCode(data: unknown): string {
            return generateCaseExecutionCode(data);
          }
        }
        return async (ctx, { code, out }) =>
          new TestRunner(
            await pyRuntimeFactory(
              ctx,
              createLogger(out),
              (imports) =>
                WebAssembly.instantiateStreaming(fetch(wasmUrl), imports),
              stdlibUrl
            ),
            code
          );
      },
    })
);
