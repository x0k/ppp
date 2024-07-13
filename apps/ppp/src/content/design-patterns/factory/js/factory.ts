// Only type imports are allowed
import type { UniversalFactory } from "testing/actor";

import type { JsTestWorkerConfig } from "@/adapters/runtime/js/test-worker";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}

export const factory: UniversalFactory<
  JsTestWorkerConfig,
  Input,
  Output
> = async (_, { jsTestCompilerFactory }) => {
  return jsTestCompilerFactory.create(async (m: TestingModule, input) =>
    m.payment(input.paymentSystem, input.base, input.amount)
  )
};
