// Only type imports are allowed
import type { UniversalFactory } from "testing/actor";

import type { UniversalFactoryData } from "@/lib/workers/js";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}

export const factory: UniversalFactory<
  Input,
  Output,
  UniversalFactoryData
> = ({ createLogger, JsTestRunner }) => {
  class TestRunner extends JsTestRunner<TestingModule, Input, Output> {
    override async executeTest(
      m: TestingModule,
      input: Input
    ): Promise<Output> {
      return m.payment(input.paymentSystem, input.base, input.amount);
    }
  }
  return async (_, { code, out }) => new TestRunner(createLogger(out), code);
};
