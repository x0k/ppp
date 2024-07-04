import { createLogger } from "libs/logger";
import { compileJsModule } from "libs/js";
import type { TestRunnerFactory } from "testing";
import { startTestRunnerActor } from "testing/actor";
import { JsTestRunner } from "testing-javascript";
import { compileTsModule } from "testing-typescript";

export interface UniversalFactoryData<M, I, O> {
  JsTestRunner: typeof JsTestRunner;
  createLogger: typeof createLogger;
  compileJsModule: typeof compileJsModule;
  compileTsModule: typeof compileTsModule;
  makeTestRunnerFactory: (
    executeTest: (m: M, input: I) => Promise<O>
  ) => TestRunnerFactory<I, O>;
}

startTestRunnerActor<
  unknown,
  unknown,
  UniversalFactoryData<unknown, unknown, unknown>
>((universalFactory) =>
  universalFactory({
    JsTestRunner,
    createLogger,
    compileJsModule,
    compileTsModule,
    makeTestRunnerFactory: (executeTest) => {
      class TestRunner extends JsTestRunner<unknown, unknown, unknown> {
        override async executeTest(
          m: unknown,
          input: unknown
        ): Promise<unknown> {
          return executeTest(m, input);
        }
      }
      return async (_, { code, out }) =>
        new TestRunner(
          createLogger(out),
          await compileJsModule(compileTsModule(code))
        );
    },
  })
);
