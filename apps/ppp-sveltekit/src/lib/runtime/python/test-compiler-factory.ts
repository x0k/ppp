import type { Context } from "libs/context";
import type { Streams } from "libs/io";
import type { TestCompiler } from "libs/testing";
import { pyRuntimeFactory, PyTestProgram } from "python-runtime";

// @ts-ignore
import wasmUrl from "python-runtime/pyodide.wasm";
// @ts-ignore
import stdlibUrl from "python-runtime/python-stdlib.zip";

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class PythonTestCompilerFactory {
  constructor(protected readonly streams: Streams) {}

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
      this.streams,
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
