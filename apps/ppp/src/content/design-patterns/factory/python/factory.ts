// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { UniversalFactoryData } from "@/lib/workers/python";

import type { Input, Output } from "../tests-data";

export const factory: UniversalFactory<
  Input,
  Output,
  UniversalFactoryData<Input, Output>
> = ({ makeTestProgramCompiler: makeTestRunnerFactory }) => {
  return makeTestRunnerFactory(
    ({ paymentSystem, amount, base }) =>
      `payment("${paymentSystem}", ${base}, ${amount})`
  );
};
