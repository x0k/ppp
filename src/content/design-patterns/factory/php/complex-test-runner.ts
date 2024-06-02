import { PHPTestRunner } from "@/lib/testing/php";

import type { ComplexTestInput } from "../test-cases";
import {
  PHP_PAYMENT_SYSTEM_ACTION_TYPES,
  PHP_PAYMENT_SYSTEM_TYPES,
} from "./model";

export class ComplexTestRunner extends PHPTestRunner<ComplexTestInput, number> {
  protected caseExecutionCode({
    paymentSystem,
    base,
    action,
    amount,
  }: ComplexTestInput): string {
    return `strval(case2(${PHP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${PHP_PAYMENT_SYSTEM_ACTION_TYPES[action]}, ${amount}))`;
  }
  protected transformResult(result: string): number {
    const r = parseInt(result, 10);
    if (isNaN(r)) {
      throw new Error(`Invalid result type: ${result}, expected number`);
    }
    return r;
  }
}
