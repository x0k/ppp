// Only type imports are allowed
import type { UniversalFactory } from "testing/actor";

import type { UniversalFactoryData } from "@/lib/workers/php";

import type { Input, Output } from "../tests-data";

// Const enum import is allowed
import type { PaymentSystemType } from "../reference";

export const factory: UniversalFactory<
  Input,
  Output,
  UniversalFactoryData<Input, Output>
> = ({ makeTestRunnerFactory }) => {
  const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
    paypal: "PaymentSystemType::PAYPAL",
    webmoney: "PaymentSystemType::WEBMONEY",
    "cat-bank": "PaymentSystemType::CAT_BANK",
  };
  return makeTestRunnerFactory(
    ({ paymentSystem, base, amount }: Input) =>
      `strval(payment(${PHP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount}))`,
    (result: string) => {
      const r = parseInt(result, 10);
      if (isNaN(r)) {
        throw new Error(`Invalid result type: ${result}, expected number`);
      }
      return r;
    }
  );
};
