import type { Streams } from "libs/io";
import { createLogger, redirect } from "libs/logger";
import { compileJsModule } from "libs/js";
import type { TestCompiler } from "libs/testing";
import { JsTestProgram } from "javascript-runtime";

export type InvokeTestMethod<M, I, O> = (m: M, input: I) => Promise<O>;

export class JsTestCompilerFactory {
  protected readonly patchedConsole: Console;

  constructor(streams: Streams) {
    this.patchedConsole = redirect(globalThis.console, createLogger(streams.out));
  }

  create<M, I, O>(
    invokeTestMethod: InvokeTestMethod<M, I, O>
  ): TestCompiler<I, O> {
    class TestProgram extends JsTestProgram<M, I, O> {
      override executeTest(m: M, input: I): Promise<O> {
        return invokeTestMethod(m, input);
      }
    }
    return {
      compile: async (_, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new TestProgram(
          await compileJsModule(files[0].content),
          this.patchedConsole
        );
      },
    };
  }
}
