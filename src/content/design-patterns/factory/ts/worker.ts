import { createLogger } from "@/lib/logger";
import type { TestRunnerConfig } from "@/lib/testing";
import { TsTestRunner } from "@/lib/testing/js";
import { startTestRunnerActor } from "@/adapters/testing-actor";

import { type Input, type Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}

class SimpleTsTestRunner extends TsTestRunner<TestingModule, Input, Output> {
  async executeTest(m: TestingModule, input: Input): Promise<Output> {
    return m.payment(input.paymentSystem, input.base, input.amount);
  }
}

startTestRunnerActor(
  async ({ code, out }: TestRunnerConfig) =>
    new SimpleTsTestRunner(createLogger(out), code)
);
