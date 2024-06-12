import type { TestRunnerConfig } from "@/lib/testing";
import {
  FailSafePHP,
  PHPTestRunner,
  phpRuntimeFactory,
} from "@/lib/testing/php";
import { startTestRunnerActor } from "@/adapters/testing-actor";

import { type Input, type Output } from "../tests-data";
import { PaymentSystemType } from "../reference";

export const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
  [PaymentSystemType.PayPal]: "PaymentSystemType::PAYPAL",
  [PaymentSystemType.WebMoney]: "PaymentSystemType::WEBMONEY",
  [PaymentSystemType.CatBank]: "PaymentSystemType::CAT_BANK",
};

class SimpleTestRunner extends PHPTestRunner<Input, Output> {
  protected caseExecutionCode({ paymentSystem, base, amount }: Input): string {
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

startTestRunnerActor(
  async ({ code, out }: TestRunnerConfig) =>
    new SimpleTestRunner(out, new FailSafePHP(phpRuntimeFactory), code)
);
