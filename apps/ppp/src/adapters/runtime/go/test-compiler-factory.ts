import { inContext, type Context } from "libs/context";
import type { Writer } from "libs/io";
import type { TestCompiler } from "testing";
import {
  createCompilerFactory,
  GoTestProgram,
  makeGoRuntimeFactory,
} from "go-runtime";

import wasmInit from "go-runtime/compiler.wasm?init";

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class GoTestCompilerFactory {
  constructor(protected readonly out: Writer) {}

  async create<I, O>(
    ctx: Context,
    generateCaseExecutionCode: GenerateCaseExecutionCode<I>
  ): Promise<TestCompiler<I, O>> {
    class TestProgram extends GoTestProgram<I, O> {
      protected override generateCaseExecutionCode(input: I): string {
        return generateCaseExecutionCode(input);
      }
    }
    const goRuntimeFactory = makeGoRuntimeFactory<O>(
      await createCompilerFactory((imports) =>
        inContext(ctx, wasmInit(imports))
      )
    );
    return {
      compile: async (ctx, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new TestProgram(
          await goRuntimeFactory(ctx, this.out, files[0].content)
        );
      },
      [Symbol.dispose]() {},
    };
  }
}