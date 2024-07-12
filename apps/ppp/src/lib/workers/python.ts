import type { Context } from "libs/context";
import { createLogger, type Logger } from "libs/logger";
import type { TestProgramCompiler } from "testing";
import { PyTestProgram, pyRuntimeFactory } from "python-runtime";
import { startTestRunnerActor } from "testing/actor";

// @ts-ignore
import wasmUrl from "python-runtime/pyodide.wasm";
// @ts-ignore
import stdlibUrl from "python-runtime/python-stdlib.zip";

export interface UniversalFactoryData<I, O> {
  createLogger: typeof createLogger;
  PyTestProgram: typeof PyTestProgram;
  makeTestProgramCompiler: (
    ctx: Context,
    generateCaseExecutionCode: (input: I) => string
  ) => Promise<TestProgramCompiler<I, O>>;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData<unknown, unknown>>(
  (out, universalFactory) =>
    universalFactory({
      PyTestProgram,
      createLogger,
      makeTestProgramCompiler: async (ctx, generateCaseExecutionCode) => {
        class TestRunner extends PyTestProgram<unknown, unknown> {
          protected override caseExecutionCode(data: unknown): string {
            return generateCaseExecutionCode(data);
          }
        }
        const pyRuntime = await pyRuntimeFactory(
          ctx,
          createLogger(out),
          (imports) =>
            WebAssembly.instantiateStreaming(
              fetch(wasmUrl, { signal: ctx.signal }),
              imports
            ),
          stdlibUrl
        );
        return {
          async compile(_, files) {
            if (files.length !== 1) {
              throw new Error(
                "Compilation of multiple files is not implemented"
              );
            }
            return new TestRunner(pyRuntime, files[0].content);
          },
          [Symbol.dispose]() {},
        };
      },
    })
);
