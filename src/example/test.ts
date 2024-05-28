import deepEqual from "fast-deep-equal";

export interface TestData<I, O> {
  input: I;
  output: O;
}

export interface TestCase<I, O> {
  run: (input: I) => Promise<O>;
}

export async function runTestCase<Arg, R>(
  testCase: TestCase<Arg, R>,
  testData: TestData<Arg, R>[]
) {
  for (const data of testData) {
    const result = await testCase.run(data.input);
    if (!deepEqual(result, data.output)) {
      throw new Error(`Test case failed, expected "${data.output}", but got "${result}"`);
    }
  }
}
