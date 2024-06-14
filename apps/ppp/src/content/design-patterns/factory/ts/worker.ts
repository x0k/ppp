import { createLogger } from "libs/logger";
import type { TestRunnerConfig } from "testing";
import { TsTestRunner } from "testing/typescript";

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
  async (_, { code, out }: TestRunnerConfig) =>
    new SimpleTsTestRunner(createLogger(out), code)
);
