import { createLogger } from "libs/logger";
import { startTestRunnerActor } from "testing/actor";
import { TsTestRunner } from "testing-typescript";

export interface UniversalFactoryData {
  TsTestRunner: typeof TsTestRunner;
  createLogger: typeof createLogger;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData>(
  (universalFactory) =>
    universalFactory({
      TsTestRunner,
      createLogger,
    })
);
