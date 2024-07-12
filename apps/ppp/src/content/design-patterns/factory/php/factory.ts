// Only type imports are allowed
import type { UniversalFactory } from "testing/actor";

import type { UniversalFactoryData } from "@/lib/workers/php";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

export const factory: UniversalFactory<
  Input,
  Output,
  UniversalFactoryData<Input, Output>
> = ({ makeTestProgramCompiler: makeTestRunnerFactory }) => {
  const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
    paypal: "PaymentSystemType::PAYPAL",
    webmoney: "PaymentSystemType::WEBMONEY",
    "cat-bank": "PaymentSystemType::CAT_BANK",
  };
  return makeTestRunnerFactory(
    ({ paymentSystem, base, amount }: Input) =>
      `payment(${PHP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount})`
  );
};
