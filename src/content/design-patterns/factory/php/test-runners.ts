import type { TestRunnerFactory } from "@/lib/testing";
import {
  FailSafePHP,
  PHPTestRunner,
  phpRuntimeFactory,
} from "@/lib/testing/php";

import {
  CaseType,
  type ComplexTestInput,
  type Inputs,
  type Outputs,
  type SimpleTestInput,
} from "../test-cases";
import {
  PHP_PAYMENT_SYSTEM_ACTION_TYPES,
  PHP_PAYMENT_SYSTEM_TYPES,
} from "./model";

class SimpleTestRunner extends PHPTestRunner<SimpleTestInput, number> {
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

class ComplexTestRunner extends PHPTestRunner<ComplexTestInput, number> {
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

export const testRunnerFactories: {
  [k in CaseType]: TestRunnerFactory<Inputs[k], Outputs[k]>;
} = {
  [CaseType.Simple]: async (code: string) =>
    new SimpleTestRunner(new FailSafePHP(phpRuntimeFactory), code),
  [CaseType.Complex]: async (code: string) =>
    new ComplexTestRunner(new FailSafePHP(phpRuntimeFactory), code),
};
