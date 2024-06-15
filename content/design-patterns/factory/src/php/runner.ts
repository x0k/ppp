import type { TestRunnerFactory } from "testing";
import { FailSafePHP, PHPTestRunner, phpRuntimeFactory } from "testing-php";

import type { Input, Output } from "../tests-data";
import { PaymentSystemType } from "../reference";

const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
  [PaymentSystemType.PayPal]: "PaymentSystemType::PAYPAL",
  [PaymentSystemType.WebMoney]: "PaymentSystemType::WEBMONEY",
  [PaymentSystemType.CatBank]: "PaymentSystemType::CAT_BANK",
};

export class TestRunner extends PHPTestRunner<Input, Output> {
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

export const factory: TestRunnerFactory<Input, Output> = async (
  _,
  { code, out }
) => new TestRunner(out, new FailSafePHP(phpRuntimeFactory), code);
