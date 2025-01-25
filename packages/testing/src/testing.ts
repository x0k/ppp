import { deepEqual } from "fast-equals";

import type { Writer } from "libs/io";
import type { Logger } from "libs/logger";
import type { Context } from "libs/context";
import type { File } from "compiler";

export interface TestCase<I, O> {
  input: I;
  output: O;
}

export function testCase<I, O>(
  test: (input: I) => O
): (input: I) => TestCase<I, O> {
  return (input) => ({
    input,
    output: test(input),
  });
}

export interface TestProgram<I, O> extends Disposable {
  run: (ctx: Context, input: I) => Promise<O>;
}

export interface TestCompiler<I, O> extends Disposable {
  compile: (ctx: Context, files: File[]) => Promise<TestProgram<I, O>>;
}

export type TestCompilerFactory<I, O> = (
  ctx: Context,
  out: Writer
) => Promise<TestCompiler<I, O>>;

export async function runTests<I, O>(
  ctx: Context,
  log: Logger,
  testProgram: TestProgram<I, O>,
  testsCases: TestCase<I, O>[]
) {
  let i = 0;
  for (; i < testsCases.length; i++) {
    if (ctx.signal.aborted) {
      log.error("Test canceled by user");
      return i;
    }
    const testCase = testsCases[i];
    try {
      const result = await testProgram.run(ctx, testCase.input);
      if (!deepEqual(result, testCase.output)) {
        log.error(
          `Test case failed, expected "${testCase.output}", but got "${result}"`
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
