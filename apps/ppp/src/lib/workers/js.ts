import { createLogger } from "libs/logger";
import type { TestRunnerFactory } from "testing";
import { startTestRunnerActor } from "testing/actor";
import { JsTestRunner } from "testing-javascript";

export interface UniversalFactoryData<M, I, O> {
  JsTestRunner: typeof JsTestRunner;
  createLogger: typeof createLogger;
  makeTestRunnerFactory: (
    invokeTestMethod: (m: M, input: I) => Promise<O>
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
    makeTestRunnerFactory: (invokeTestMethod) => {
      class TestRunner extends JsTestRunner<unknown, unknown, unknown> {
        override executeTest(m: unknown, input: unknown): Promise<unknown> {
          return invokeTestMethod(m, input);
        }
      }
      return async (_, { code, out }) =>
        new TestRunner(createLogger(out), code);
    },
  })
);