import type { Context } from 'libs/context';
import type { Streams } from "libs/io";
import { phpCompilerFactory, PHPTestProgram } from "php-runtime";
import type { TestCompiler } from "libs/testing";

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class PhpTestCompilerFactory {
  constructor(protected readonly streams: Streams) {}

  async create<I, O>(
    ctx: Context,
    generateCaseExecutionCode: GenerateCaseExecutionCode<I>
  ): Promise<TestCompiler<I, O>> {
    class TestProgram extends PHPTestProgram<I, O> {
      protected override caseExecutionCode(data: I): string {
        return generateCaseExecutionCode(data);
      }
    }
    const php = await phpCompilerFactory(ctx);
    return {
      compile: async (ctx, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        const program = new TestProgram(this.streams, php, files[0].content);
        const disposable = ctx.onCancel(() => {
          disposable[Symbol.dispose]()
          program[Symbol.dispose]()
        })
        return program
      },
    };
  }
}
