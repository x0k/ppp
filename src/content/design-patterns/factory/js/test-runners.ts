import { TsTestRunner, JsTestRunner } from "@/lib/testing/js";

import { type Input, type Output } from "../tests-data";
import type { PaymentSystemType } from '../reference';

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}


class SimpleJsTestRunner extends JsTestRunner<TestingModule, Input, Output> {
  async executeTest(m: TestingModule, input: Input): Promise<Output> {
    return m.payment(input.paymentSystem, input.base, input.amount);
  }
}

export const jsTestRunnerFactory = async (code: string) =>
  new SimpleJsTestRunner(code);

class SimpleTsTestRunner extends TsTestRunner<TestingModule, Input, Output> {
  async executeTest(m: TestingModule, input: Input): Promise<Output> {
    return m.payment(input.paymentSystem, input.base, input.amount);
  }
}

export const tsTestRunnerFactory = async (code: string) =>
  new SimpleTsTestRunner(code);
