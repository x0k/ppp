import type { TestRunnerFactory } from "testing";
import { FailSafePHP, PHPTestRunner, phpRuntimeFactory } from "testing-php";
import { startTestRunnerActor } from "testing/actor";

export interface UniversalFactoryData<I, O> {
  PHPTestRunner: typeof PHPTestRunner;
  FailSafePHP: typeof FailSafePHP;
  phpRuntimeFactory: typeof phpRuntimeFactory;
  makeTestRunnerFactory: (
    generateCaseExecutionCode: (input: I) => string,
    transformResult: (result: string) => O
  ) => TestRunnerFactory<I, O>;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData<unknown, unknown>>(
  (universalFactory) =>
    universalFactory({
      PHPTestRunner,
      FailSafePHP,
      phpRuntimeFactory,
      makeTestRunnerFactory: (generateCaseExecutionCode, transformResult) => {
        class TestRunner extends PHPTestRunner<unknown, unknown> {
          protected override caseExecutionCode(data: unknown): string {
            return generateCaseExecutionCode(data);
          }
          protected transformResult(result: string) {
            return transformResult(result);
          }
        }
        return async (_, { code, out }) =>
          new TestRunner(out, new FailSafePHP(phpRuntimeFactory), code);
      },
    })
);
