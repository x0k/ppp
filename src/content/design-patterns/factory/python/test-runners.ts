import type { TestRunnerConfig } from '@/lib/testing';
import { PyTestRunner, pyRuntimeFactory } from "@/lib/testing/python";

import { type Input, type Output } from "../tests-data";

class SimpleTestRunner extends PyTestRunner<Input, Output> {
  protected caseExecutionCode({ paymentSystem, base, amount }: Input): string {
    return `payment("${paymentSystem}", ${base}, ${amount})`;
  }
}

export const testRunnerFactory = async ({ code }: TestRunnerConfig) =>
  new SimpleTestRunner(await pyRuntimeFactory(), code);
