import { inContext, type Context } from "libs/context";
import { createLogger } from "libs/logger";
import type { TestProgramCompiler } from "testing";
import {
  GoTestProgram,
  createCompilerFactory,
  makeGoRuntimeFactory,
} from "go-runtime";
import { startTestRunnerActor } from "testing/actor";

import wasmInit from "go-runtime/compiler.wasm?init";

export interface GoUniversalFactoryData<I, O> {
  createLogger: typeof createLogger;
  GoTestProgram: typeof GoTestProgram;
  makeTestProgramCompiler: (
    ctx: Context,
    generateCaseExecutionCode: (input: I) => string
  ) => Promise<TestProgramCompiler<I, O>>;
}

startTestRunnerActor<
  unknown,
  unknown,
  GoUniversalFactoryData<unknown, unknown>
>((out, universalFactory) =>
  universalFactory({
    GoTestProgram,
    createLogger,
    makeTestProgramCompiler: async (ctx, generateCaseExecutionCode) => {
      class TestProgram extends GoTestProgram<unknown, unknown> {
        protected override generateCaseExecutionCode(input: unknown): string {
          return generateCaseExecutionCode(input);
        }
      }
      const goRuntimeFactory = makeGoRuntimeFactory(
        await createCompilerFactory((imports) =>
          inContext(ctx, wasmInit(imports))
        )
      );
      return {
        async compile(ctx, files) {
          if (files.length !== 1) {
            throw new Error("Compilation of multiple files is not implemented");
          }
          return new TestProgram(
            await goRuntimeFactory(ctx, out, files[0].content)
          );
        },
        [Symbol.dispose]() {},
      };
    },
  })
);
