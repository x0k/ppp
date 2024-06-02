import type { TestRunnerFactory } from "@/lib/testing";
import { FailSafePHP, phpRuntimeFactory } from "@/lib/testing/php";

import { CaseType, type Inputs, type Outputs } from "../test-cases";
import { SimpleTestRunner } from "./simple-test-runner";
import { ComplexTestRunner } from "./complex-test-runner";

export const testRunnerFactories: {
  [k in CaseType]: TestRunnerFactory<Inputs[k], Outputs[k]>;
} = {
  [CaseType.Simple]: async (code: string) =>
    new SimpleTestRunner(new FailSafePHP(phpRuntimeFactory), code),
  [CaseType.Complex]: async (code: string) =>
    new ComplexTestRunner(new FailSafePHP(phpRuntimeFactory), code),
};
