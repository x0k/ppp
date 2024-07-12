// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { UniversalFactoryData } from "@/lib/workers/ts";

import type { PaymentSystemType } from "../reference";
import type { Input, Output } from "../tests-data";

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}

export const factory: UniversalFactory<
  Input,
  Output,
  UniversalFactoryData<TestingModule, Input, Output>
> = ({ makeTestProgramCompiler: makeTestRunnerFactory }) => {
  return makeTestRunnerFactory(
    async (m: TestingModule, input: Input): Promise<Output> =>
      m.payment(input.paymentSystem, input.base, input.amount)
  );
};
