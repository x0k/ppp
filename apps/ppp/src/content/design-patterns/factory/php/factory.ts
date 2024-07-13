// Only type imports are allowed
import type { UniversalFactory } from "testing/actor";

import type { PhpTestWorkerConfig } from "@/adapters/runtime/php/test-worker";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

export const factory: UniversalFactory<PhpTestWorkerConfig, Input, Output> = (
  ctx,
  { phpTestCompilerFactory }
) => {
  const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
    paypal: "PaymentSystemType::PAYPAL",
    webmoney: "PaymentSystemType::WEBMONEY",
    "cat-bank": "PaymentSystemType::CAT_BANK",
  };
  return phpTestCompilerFactory.create(
    ctx,
    ({ paymentSystem, base, amount }: Input) =>
      `payment(${PHP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount})`
  );
};
