import { inContext, type Context } from 'libs/context';
import type { Writer } from "libs/io";
import { FailSafePHP, phpRuntimeFactory, PHPTestProgram } from "php-runtime";
import type { TestProgramCompiler } from "testing";

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class PhpTestCompilerFactory {
  constructor(protected readonly out: Writer) {}

  async create<I, O>(
    ctx: Context,
    generateCaseExecutionCode: GenerateCaseExecutionCode<I>
  ): Promise<TestProgramCompiler<I, O>> {
    class TestProgram extends PHPTestProgram<I, O> {
      protected override caseExecutionCode(data: I): string {
        return generateCaseExecutionCode(data);
      }
    }
    const failSafePhp = new FailSafePHP(phpRuntimeFactory);
    await inContext(ctx, failSafePhp.initialize());
    return {
      compile: async (_, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new TestProgram(this.out, failSafePhp, files[0].content);
      },
      [Symbol.dispose]() {
        failSafePhp[Symbol.dispose]();
      },
    };
  }
}
