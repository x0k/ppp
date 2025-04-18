import { inContext, type Context } from "libs/context";
import type { Streams } from "libs/io";
import type { TestCompiler } from "libs/testing";
import {
  makeCompilerFactory,
  makeGoCompilerFactory,
  makeGoEvaluatorFactory,
  GoTestProgram,
} from "go-runtime";

import wasmInit from "go-runtime/compiler.wasm?init";

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class GoTestCompilerFactory {
  constructor(protected readonly streams: Streams) {}

  async create<I, O>(
    ctx: Context,
    generateCaseExecutionCode: GenerateCaseExecutionCode<I>
  ): Promise<TestCompiler<I, O>> {
    class TestProgram extends GoTestProgram<I, O> {
      protected override generateCaseExecutionCode(input: I): string {
        return generateCaseExecutionCode(input);
      }
    }
    const goEvaluatorFactory = makeGoEvaluatorFactory<O>(
      makeGoCompilerFactory(
        await makeCompilerFactory((imports) =>
          inContext(ctx, wasmInit(imports))
        )
      )
    );
    return {
      compile: async (ctx, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new TestProgram(
          await goEvaluatorFactory(ctx, this.streams, files[0].content)
        );
      },
    };
  }
}
