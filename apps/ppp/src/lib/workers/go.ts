import { createLogger } from "libs/logger";
import type { TestRunnerFactory } from "testing";
import {
  GoTestRunner,
  createCompilerFactory,
  makeGoRuntimeFactory,
  type GoRuntimeFactory,
} from "go-runtime";
import { startTestRunnerActor } from "testing/actor";
import wasmInit from "go-runtime/compiler.wasm?init";

export interface GoUniversalFactoryData<I, O> {
  createLogger: typeof createLogger;
  GoTestRunner: typeof GoTestRunner;
  goRuntimeFactory: GoRuntimeFactory<O>;
  compilerFactory: ReturnType<typeof createCompilerFactory>;
  makeTestRunnerFactory: (
    generateCaseExecutionCode: (input: I) => string
  ) => TestRunnerFactory<I, O>;
}

const compilerFactory = createCompilerFactory(wasmInit);

startTestRunnerActor<
  unknown,
  unknown,
  GoUniversalFactoryData<unknown, unknown>
>((universalFactory) =>
  universalFactory({
    GoTestRunner,
    createLogger,
    compilerFactory,
    goRuntimeFactory: async (ctx, log, code) =>
      makeGoRuntimeFactory(await compilerFactory)(ctx, log, code),
    makeTestRunnerFactory: (generateCaseExecutionCode) => {
      class TestRunner extends GoTestRunner<unknown, unknown> {
        protected override generateCaseExecutionCode(input: unknown): string {
          return generateCaseExecutionCode(input);
        }
      }
      return async (ctx, { code, out }) =>
        new TestRunner(
          await makeGoRuntimeFactory(await compilerFactory)(ctx, out, code)
        );
    },
  })
);
