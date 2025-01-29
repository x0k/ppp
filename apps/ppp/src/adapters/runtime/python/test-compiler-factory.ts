import type { Context } from "libs/context";
import type { Streams } from "libs/io";
import { createLogger, type Logger } from "libs/logger";
import type { TestCompiler } from "testing";
import { pyRuntimeFactory, PyTestProgram } from "python-runtime";

// @ts-ignore
import wasmUrl from "python-runtime/pyodide.wasm";
// @ts-ignore
import stdlibUrl from "python-runtime/python-stdlib.zip";

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class PythonTestCompilerFactory {
  protected readonly log: Logger;

  constructor(streams: Streams) {
    this.log = createLogger(streams.out);
  }

  async create<I, O>(
    ctx: Context,
    generateCaseExecutionCode: GenerateCaseExecutionCode<I>
  ): Promise<TestCompiler<I, O>> {
    class TestProgram extends PyTestProgram<I, O> {
      protected override caseExecutionCode(data: I): string {
        return generateCaseExecutionCode(data);
      }
    }
    const pyRuntime = await pyRuntimeFactory(
      ctx,
      this.log,
      (ctx, imports) =>
        WebAssembly.instantiateStreaming(
          fetch(wasmUrl, { signal: ctx.signal }),
          imports
        ),
      stdlibUrl
    );
    return {
      async compile(_, files) {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new TestProgram(pyRuntime, files[0].content);
      },
    };
  }
}
