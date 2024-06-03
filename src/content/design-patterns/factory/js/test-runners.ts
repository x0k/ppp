import type { TestRunnerFactory } from "@/lib/testing";
import { TsTestRunner, JsTestRunner } from "@/lib/testing/js";

import {
  CaseType,
  type ComplexTestInput,
  type Inputs,
  type Outputs,
  type SimpleTestInput,
} from "../test-cases";
import type { TestingModule } from "./model";

class SimpleJsTestRunner extends JsTestRunner<
  TestingModule,
  SimpleTestInput,
  number
> {
  async executeTest(m: TestingModule, input: SimpleTestInput): Promise<number> {
    return m.case1(input.paymentSystem, input.base, input.amount);
  }
}

class ComplexJsTestRunner extends JsTestRunner<
  TestingModule,
  ComplexTestInput,
  number
> {
  async executeTest(
    m: TestingModule,
    input: ComplexTestInput
  ): Promise<number> {
    return m.case2(input.paymentSystem, input.base, input.action, input.amount);
  }
}

export const jsTestRunnerFactories: {
  [k in CaseType]: TestRunnerFactory<Inputs[k], Outputs[k]>;
} = {
  [CaseType.Simple]: async (code) => new SimpleJsTestRunner(code),
  [CaseType.Complex]: async (code) => new ComplexJsTestRunner(code),
};

class SimpleTsTestRunner extends TsTestRunner<
  TestingModule,
  SimpleTestInput,
  number
> {
  async executeTest(m: TestingModule, input: SimpleTestInput): Promise<number> {
    return m.case1(input.paymentSystem, input.base, input.amount);
  }
}

class ComplexTsTestRunner extends TsTestRunner<
  TestingModule,
  ComplexTestInput,
  number
> {
  async executeTest(
    m: TestingModule,
    input: ComplexTestInput
  ): Promise<number> {
    return m.case2(input.paymentSystem, input.base, input.action, input.amount);
  }
}

export const tsTestRunnerFactories: {
  [k in CaseType]: TestRunnerFactory<Inputs[k], Outputs[k]>;
} = {
  [CaseType.Simple]: async (code) => new SimpleTsTestRunner(code),
  [CaseType.Complex]: async (code) => new ComplexTsTestRunner(code),
};
