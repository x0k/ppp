import { createLogger } from "libs/logger";
import type { TestRunnerConfig, TestRunnerFactory } from "testing";
import { TsTestRunner } from "testing-typescript";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}

export class TestRunner extends TsTestRunner<TestingModule, Input, Output> {
  async executeTest(m: TestingModule, input: Input): Promise<Output> {
    return m.payment(input.paymentSystem, input.base, input.amount);
  }
}

export const factory: TestRunnerFactory<Input, Output> = async (
  _,
  { code, out }: TestRunnerConfig
) => new TestRunner(createLogger(out), code);
