import { createLogger } from "libs/logger";
import { PyTestRunner, pyRuntimeFactory } from "testing-python";
import { startTestRunnerActor } from "testing/actor";

export interface UniversalFactoryData {
  createLogger: typeof createLogger;
  PyTestRunner: typeof PyTestRunner;
  pyRuntimeFactory: typeof pyRuntimeFactory;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData>(
  (universalFactory) =>
    universalFactory({
      PyTestRunner,
      createLogger,
      pyRuntimeFactory,
    })
);
