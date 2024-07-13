// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { GoTestWorkerConfig } from "@/adapters/runtime/go/test-worker";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

export const factory: UniversalFactory<GoTestWorkerConfig, Input, Output> = (
  ctx,
  { goTestCompilerFactory }
) => {
  const GO_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, number> = {
    paypal: 0,
    webmoney: 1,
    "cat-bank": 2,
  };
  return goTestCompilerFactory.create(
    ctx,
    ({ paymentSystem, amount, base }) =>
      `payment.Payment(payment.SystemType(${GO_PAYMENT_SYSTEM_TYPES[paymentSystem]}), ${base}, ${amount})`
  );
};
