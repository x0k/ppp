import type { TestRunnerFactory } from "testing";
import { PyTestRunner, pyRuntimeFactory } from "testing/python";

import { startTestRunnerActor } from "@/adapters/testing-actor";

import { type Input, type Output } from "../tests-data";

class TestRunner extends PyTestRunner<Input, Output> {
  protected caseExecutionCode({ paymentSystem, base, amount }: Input): string {
    return `payment("${paymentSystem}", ${base}, ${amount})`;
  }
}

const factory: TestRunnerFactory<Input, Output> = async (ctx, { code, out }) =>
  new TestRunner(await pyRuntimeFactory(ctx, out), code);

startTestRunnerActor(factory);
