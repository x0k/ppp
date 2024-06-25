import { createLogger } from "libs/logger";
import { GoTestRunner, goRuntimeFactory } from "testing-go";
import { startTestRunnerActor } from "testing/actor";

export interface UniversalFactoryData {
  createLogger: typeof createLogger;
  GoTestRunner: typeof GoTestRunner;
  goRuntimeFactory: typeof goRuntimeFactory;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData>(
  (universalFactory) =>
    universalFactory({
      GoTestRunner,
      createLogger,
      goRuntimeFactory,
    })
);
