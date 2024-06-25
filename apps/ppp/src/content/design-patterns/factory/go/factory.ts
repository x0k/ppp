// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { UniversalFactoryData } from "@/lib/workers/go";

import type { Input, Output } from "../tests-data";

export const factory: UniversalFactory<Input, Output, UniversalFactoryData> = ({
  GoTestRunner,
  goRuntimeFactory,
  createLogger,
}) => {
  class TestRunner extends GoTestRunner<Input, Output> {
    protected override generateCaseExecutionCode({
      paymentSystem,
      amount,
      base,
    }: Input): string {
      return `factory.Payment(factory.PaymentSystemType("${paymentSystem}"), ${base}, ${amount})`;
    }
  }
  return async (ctx, { code, out }) =>
    new TestRunner(await goRuntimeFactory(ctx, createLogger(out), code));
};
