import type { TestRunnerFactory } from "testing";
import { FailSafePHP, PHPTestRunner, phpRuntimeFactory } from "php-runtime";
import { startTestRunnerActor } from "testing/actor";

export interface UniversalFactoryData<I, O> {
  PHPTestRunner: typeof PHPTestRunner;
  FailSafePHP: typeof FailSafePHP;
  phpRuntimeFactory: typeof phpRuntimeFactory;
  makeTestRunnerFactory: (
    generateCaseExecutionCode: (input: I) => string
  ) => TestRunnerFactory<I, O>;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData<unknown, unknown>>(
  (universalFactory) =>
    universalFactory({
      PHPTestRunner,
      FailSafePHP,
      phpRuntimeFactory,
      makeTestRunnerFactory: (generateCaseExecutionCode) => {
        class TestRunner extends PHPTestRunner<unknown, unknown> {
          protected override caseExecutionCode(data: unknown): string {
            return generateCaseExecutionCode(data);
          }
        }
        return async (_, { code, out }) =>
          new TestRunner(out, new FailSafePHP(phpRuntimeFactory), code);
      },
    })
);
