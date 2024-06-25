import { createLogger } from "libs/logger";
import { startTestRunnerActor } from "testing/actor";
import { JsTestRunner } from "testing-javascript";

export interface UniversalFactoryData {
  JsTestRunner: typeof JsTestRunner;
  createLogger: typeof createLogger;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData>(
  (universalFactory) =>
    universalFactory({
      JsTestRunner,
      createLogger,
    })
);
