// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { TsTestWorkerConfig } from "@/adapters/runtime/ts/test-worker";

import type { PaymentSystemType } from "../reference";
import type { Input, Output } from "../tests-data";

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}

export const factory: UniversalFactory<
  TsTestWorkerConfig,
  Input,
  Output
> = async (_, { tsTestCompilerFactory }) =>
  tsTestCompilerFactory.create(async (m: TestingModule, input: Input) =>
    m.payment(input.paymentSystem, input.base, input.amount)
  );
