import { FailSafePHP, PHPTestRunner, phpRuntimeFactory } from "testing-php";
import { startTestRunnerActor } from "testing/actor";

export interface UniversalFactoryData {
  PHPTestRunner: typeof PHPTestRunner;
  FailSafePHP: typeof FailSafePHP;
  phpRuntimeFactory: typeof phpRuntimeFactory;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData>(
  (universalFactory) =>
    universalFactory({
      PHPTestRunner,
      FailSafePHP,
      phpRuntimeFactory,
    })
);
