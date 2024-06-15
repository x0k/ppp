import { createLogger } from "libs/logger";
import type { TestRunnerFactory } from "testing";
import { startTestRunnerActor } from "testing/actor";
import { JsTestRunner } from 'testing-javascript'

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}

class TestRunner extends JsTestRunner<TestingModule, Input, Output> {
  async executeTest(m: TestingModule, input: Input): Promise<Output> {
    return m.payment(input.paymentSystem, input.base, input.amount);
  }
}

const factory: TestRunnerFactory<Input, Output> = async (_, { code, out }) =>
  new TestRunner(createLogger(out), code);

startTestRunnerActor(factory);
