import { createLogger } from 'libs/logger';
import type { TestRunnerFactory } from "testing";
import { startTestRunnerActor } from "testing/actor";
import { PyTestRunner, pyRuntimeFactory } from "testing-python";

import type { Input, Output } from "../tests-data";

class TestRunner extends PyTestRunner<Input, Output> {
  protected override caseExecutionCode({ paymentSystem, base, amount }: Input): string {
    return `payment("${paymentSystem}", ${base}, ${amount})`;
  }
}

const factory: TestRunnerFactory<Input, Output> = async (ctx, { code, out }) =>
  new TestRunner(await pyRuntimeFactory(ctx, createLogger(out)), code);

startTestRunnerActor(factory);
