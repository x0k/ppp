import deepEqual from "fast-deep-equal";

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
  run: (input: I) => Promise<O>;
}

export type TestRunnerFactory<I, O> = (
  code: string
) => Promise<TestRunner<I, O>>;

export async function runTest<Arg, R>(
  testCase: TestRunner<Arg, R>,
  testData: TestData<Arg, R>[]
) {
  let i = 0;
  for (; i < testData.length; i++) {
    const data = testData[i];
    try {
      const result = await testCase.run(data.input);
      if (!deepEqual(result, data.output)) {
        console.error(
          `Test case failed, expected "${data.output}", but got "${result}"`
        );
        return i;
      }
    } catch (err) {
      console.error(`Test case failed: ${err}`);
      return i;
    }
  }
  return i;
}
