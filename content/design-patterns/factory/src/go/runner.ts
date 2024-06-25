import { createLogger } from "libs/logger";
import { GoTestRunner, goRuntimeFactory } from "testing-go";
import type { TestRunnerFactory } from "testing";

import type { Input, Output } from "../tests-data";

export class TestRunner extends GoTestRunner<Input, Output> {
  protected override generateCaseExecutionCode({
    paymentSystem,
    amount,
    base,
  }: Input): string {
    return `factory.Payment(factory.PaymentSystemType("${paymentSystem}"), ${base}, ${amount})`;
  }
}

export const factory: TestRunnerFactory<Input, Output> = async (
  ctx,
  { code, out }
) => new TestRunner(await goRuntimeFactory(ctx, createLogger(out), code));
