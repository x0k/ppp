import type { Context } from "libs/context";
import type { Streams, Writer } from "libs/io";
import { createLogger, redirect } from "libs/logger";
import { compileJsModule } from "libs/js";
import type { TestCompiler } from "libs/testing";
import { JsTestProgram } from "javascript-runtime";
import { GleamModuleCompiler } from "gleam-runtime";

// @ts-expect-error .wasm is an asset
import compilerWasmUrl from "gleam-runtime/compiler.wasm";

const precompiledGleamStdlibIndexUrl = new URL(
  import.meta.env.BASE_URL + "/_astro/gleam",
  globalThis.location.origin
).toString();

export type ExecuteTest<M, I, O> = (m: M, input: I) => Promise<O>;

export class GleamTestCompilerFactory {

  protected readonly patchedConsole: Console;

  constructor(protected readonly streams: Streams) {
    this.patchedConsole = redirect(globalThis.console, createLogger(streams.out));
  }

  async create<M, I, O>(
    ctx: Context,
    executeTest: ExecuteTest<M, I, O>
  ): Promise<TestCompiler<I, O>> {
    class TestProgram extends JsTestProgram<M, I, O> {
      override async executeTest(m: M, input: I): Promise<O> {
        return executeTest(m, input);
      }
    }
    const compiler = new GleamModuleCompiler(
      this.streams.out,
      precompiledGleamStdlibIndexUrl,
      await WebAssembly.compileStreaming(
        fetch(compilerWasmUrl, { signal: ctx.signal })
      )
    );
    return {
      compile: async (_, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        const jsCode = compiler.compile(files[0].content);
        return new TestProgram(await compileJsModule(jsCode), this.patchedConsole);
      },
    };
  }
}
