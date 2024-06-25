// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { UniversalFactoryData } from "@/lib/workers/python";

import type { Input, Output } from "../tests-data";

export const factory: UniversalFactory<Input, Output, UniversalFactoryData> = ({
  createLogger,
  PyTestRunner,
  pyRuntimeFactory,
}) => {
  class TestRunner extends PyTestRunner<Input, Output> {
    protected override caseExecutionCode({
      paymentSystem,
      base,
      amount,
    }: Input): string {
      return `payment("${paymentSystem}", ${base}, ${amount})`;
    }
  }

  return async (ctx, { code, out }) =>
    new TestRunner(await pyRuntimeFactory(ctx, createLogger(out)), code);
};
