// Only type imports are allowed
import type { UniversalFactory } from "testing/actor";

import type { UniversalFactoryData } from "@/lib/workers/php";

import type { Input, Output } from "../tests-data";

// Const enum import is allowed
import type { PaymentSystemType } from "../reference";

export const factory: UniversalFactory<Input, Output, UniversalFactoryData> = ({
  FailSafePHP,
  PHPTestRunner,
  phpRuntimeFactory,
}) => {
  const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
    "paypal": "PaymentSystemType::PAYPAL",
    "webmoney": "PaymentSystemType::WEBMONEY",
    "cat-bank": "PaymentSystemType::CAT_BANK",
  };
  class TestRunner extends PHPTestRunner<Input, Output> {
    protected override caseExecutionCode({
      paymentSystem,
      base,
      amount,
    }: Input): string {
      return `strval(payment(${PHP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount}))`;
    }
    protected transformResult(result: string): Output {
      const r = parseInt(result, 10);
      if (isNaN(r)) {
        throw new Error(`Invalid result type: ${result}, expected number`);
      }
      return r;
    }
  }
  return async (_, { code, out }) =>
    new TestRunner(out, new FailSafePHP(phpRuntimeFactory), code);
};
