import { makeErrorWriter, type Writer } from "libs/io";
import { inContext, type Context } from "libs/context";
import type { TestCompiler } from "testing";
import { RubyTestProgram, createRubyVM } from "ruby-runtime";

//@ts-expect-error .wasm is an asset
import rubyWasmUrl from "ruby-runtime/ruby.wasm";

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class RubyTestCompilerFactory {
  protected readonly errorWriter: Writer;
  constructor(protected readonly out: Writer) {
    this.errorWriter = makeErrorWriter(out);
  }

  async create<I, O>(
    ctx: Context,
    generateCaseExecutionCode: GenerateCaseExecutionCode<I>
  ): Promise<TestCompiler<I, O>> {
    class TestProgram extends RubyTestProgram<I, O> {
      protected override caseExecutionCode(input: I): string {
        return generateCaseExecutionCode(input);
      }
    }
    const rubyWasmModule = await WebAssembly.compileStreaming(
      fetch(rubyWasmUrl, { signal: ctx.signal, cache: "force-cache" })
    );
    return {
      compile: async (ctx, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        const rubyVm = await createRubyVM(
          ctx,
          this.out,
          this.errorWriter,
          rubyWasmModule
        );
        await inContext(ctx, rubyVm.evalAsync(files[0].content));
        return new TestProgram(rubyVm);
      },
      [Symbol.dispose]() {},
    };
  }
}
