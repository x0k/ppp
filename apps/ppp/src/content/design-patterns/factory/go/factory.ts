// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { GoUniversalFactoryData } from "@/lib/workers/go";

import type { Input, Output } from "../tests-data";

export const factory: UniversalFactory<
  Input,
  Output,
  GoUniversalFactoryData<Input, Output>
> = ({ makeTestRunnerFactory }) => {
  return makeTestRunnerFactory(
    ({ paymentSystem, amount, base }) =>
      `factory.Payment(factory.PaymentSystemType("${paymentSystem}"), ${base}, ${amount})`
  );
};
