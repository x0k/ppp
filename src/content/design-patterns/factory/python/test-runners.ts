import type { TestRunnerFactory } from "@/lib/testing";
import { PyTestRunner, pyRuntimeFactory } from "@/lib/testing/python";

import {
  type SimpleTestInput,
  type ComplexTestInput,
  CaseType,
  type Inputs,
  type Outputs,
} from "../test-cases";

class SimpleTestRunner extends PyTestRunner<SimpleTestInput, number> {
  protected caseExecutionCode({
    paymentSystem,
    base,
    amount,
  }: SimpleTestInput): string {
    return `case1("${paymentSystem}", ${base}, ${amount})`;
  }
}

class ComplexTestRunner extends PyTestRunner<ComplexTestInput, number> {
  protected caseExecutionCode({
    paymentSystem,
    base,
    action,
    amount,
  }: ComplexTestInput): string {
    return `case2("${paymentSystem}", ${base}, "${action}", ${amount})`;
  }
}

export const testRunnerFactories: {
  [k in CaseType]: TestRunnerFactory<Inputs[k], Outputs[k]>;
} = {
  [CaseType.Simple]: async (code: string) =>
    new SimpleTestRunner(await pyRuntimeFactory(), code),
  [CaseType.Complex]: async (code: string) =>
    new ComplexTestRunner(await pyRuntimeFactory(), code),
};
