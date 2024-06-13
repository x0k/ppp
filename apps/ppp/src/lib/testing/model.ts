import deepEqual from "fast-deep-equal";

import type { Logger, Writer } from "@/lib/logger";
import { type Context } from "@/lib/context";

export interface TestData<I, O> {
  input: I;
  output: O;
}

export function testData<I, O>(
  mapper: (arg: I) => O
): (arg: I) => TestData<I, O> {
  return (input) => ({
    input,
    output: mapper(input),
  });
}

export interface TestRunner<I, O> extends Disposable {
  run: (ctx: Context, input: I) => Promise<O>;
}

export interface TestRunnerConfig {
  code: string;
  out: Writer;
}

export type TestRunnerFactory<I, O> = (
  ctx: Context,
  config: TestRunnerConfig
) => Promise<TestRunner<I, O>>;

export async function runTests<Arg, R>(
  ctx: Context,
  log: Logger,
  testRunner: TestRunner<Arg, R>,
  testsData: TestData<Arg, R>[]
) {
  let i = 0;
  for (; i < testsData.length; i++) {
    if (ctx.canceled) {
      log.error("Test canceled by user");
      return i;
    }
    const data = testsData[i];
    try {
      const result = await testRunner.run(ctx, data.input);
      if (!deepEqual(result, data.output)) {
        log.error(
          `Test case failed, expected "${data.output}", but got "${result}"`
        );
        return i;
      }
    } catch (err) {
      log.error(`Test case failed: ${err}`);
      return i;
    }
  }
  return i;
}
