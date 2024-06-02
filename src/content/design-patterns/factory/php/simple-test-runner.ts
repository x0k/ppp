import { PHPTestRunner } from "@/lib/testing/php";

import type { SimpleTestInput } from "../test-cases";
import { PHP_PAYMENT_SYSTEM_TYPES } from "./model";

export class SimpleTestRunner extends PHPTestRunner<SimpleTestInput, number> {
  protected caseExecutionCode({
    paymentSystem,
    base,
    amount,
  }: SimpleTestInput): string {
    return `strval(case1(${PHP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount}))`;
  }
  protected transformResult(result: string): number {
    const r = parseInt(result, 10);
    if (isNaN(r)) {
      throw new Error(`Invalid result type: ${result}, expected number`);
    }
    return r;
  }
}
