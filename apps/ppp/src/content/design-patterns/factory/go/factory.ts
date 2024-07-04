// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { GoUniversalFactoryData } from "@/lib/workers/go";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

export const factory: UniversalFactory<
  Input,
  Output,
  GoUniversalFactoryData<Input, Output>
> = ({ makeTestRunnerFactory }) => {
  const GO_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, number> = {
    paypal: 0,
    webmoney: 1,
    "cat-bank": 2,
  };
  return makeTestRunnerFactory(
    ({ paymentSystem, amount, base }) =>
      `payment.Payment(payment.SystemType(${GO_PAYMENT_SYSTEM_TYPES[paymentSystem]}), ${base}, ${amount})`
  );
};
