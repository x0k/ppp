import type { TestProgramCompiler } from "testing";
import { FailSafePHP, PHPTestProgram, phpRuntimeFactory } from "php-runtime";
import { startTestRunnerActor } from "testing/actor";

export interface UniversalFactoryData<I, O> {
  PHPTestProgram: typeof PHPTestProgram;
  FailSafePHP: typeof FailSafePHP;
  phpRuntimeFactory: typeof phpRuntimeFactory;
  makeTestProgramCompiler: (
    generateCaseExecutionCode: (input: I) => string
  ) => TestProgramCompiler<I, O>;
}

startTestRunnerActor<unknown, unknown, UniversalFactoryData<unknown, unknown>>(
  (out, universalFactory) =>
    universalFactory({
      PHPTestProgram,
      FailSafePHP,
      phpRuntimeFactory,
      makeTestProgramCompiler: (generateCaseExecutionCode) => {
        class TestProgram extends PHPTestProgram<unknown, unknown> {
          protected override caseExecutionCode(data: unknown): string {
            return generateCaseExecutionCode(data);
          }
        }
        const failSafePhp = new FailSafePHP(phpRuntimeFactory);
        return {
          async compile (_, files) {
            if (files.length !== 1) {
              throw new Error("Compilation of multiple files is not implemented");
            }
            return new TestProgram(out, failSafePhp, files[0].content);
          },
          [Symbol.dispose]() {
            failSafePhp[Symbol.dispose]();
          },
        }
      },
    })
);
