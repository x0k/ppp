import type { Context } from "libs/context";
import { compileJsModule } from "libs/js";
import { createLogger, redirect } from "libs/logger";
import type { TestProgramCompiler } from "testing";
import { JsTestProgram } from "javascript-runtime";
import { GleamModuleCompiler } from "gleam-runtime";

// @ts-expect-error .wasm is an asset
import compilerWasmUrl from "gleam-runtime/compiler.wasm";
import { startTestRunnerActor } from "testing/actor";

const precompiledGleamStdlibIndexUrl = new URL(
  import.meta.env.BASE_URL + "/_astro/gleam",
  globalThis.location.origin
).toString();

export interface GleamUniversalFactoryData<M, I, O> {
  JsTestProgram: typeof JsTestProgram;
  createLogger: typeof createLogger;
  compileJsModule: typeof compileJsModule;
  GleamModuleCompiler: typeof GleamModuleCompiler;
  precompiledGleamStdlibIndexUrl: string;
  makeTestProgramCompiler: (
    ctx: Context,
    executeTest: (m: M, input: I) => Promise<O>
  ) => Promise<TestProgramCompiler<I, O>>;
}

startTestRunnerActor<
  unknown,
  unknown,
  GleamUniversalFactoryData<unknown, unknown, unknown>
>((out, universalFactory) =>
  universalFactory({
    JsTestProgram,
    createLogger,
    compileJsModule,
    GleamModuleCompiler,
    precompiledGleamStdlibIndexUrl,
    makeTestProgramCompiler: async (ctx, executeTest) => {
      class TestProgram extends JsTestProgram<unknown, unknown, unknown> {
        override async executeTest(
          m: unknown,
          input: unknown
        ): Promise<unknown> {
          return executeTest(m, input);
        }
      }
      const compiler = new GleamModuleCompiler(
        out,
        precompiledGleamStdlibIndexUrl,
        await WebAssembly.compileStreaming(
          fetch(compilerWasmUrl, { signal: ctx.signal })
        )
      );
      const patchedConsole = redirect(globalThis.console, createLogger(out));
      return {
        async compile(_, files) {
          if (files.length !== 1) {
            throw new Error("Compilation of multiple files is not implemented");
          }
          const jsCode = compiler.compile(files[0].content);
          return new TestProgram(await compileJsModule(jsCode), patchedConsole);
        },
        [Symbol.dispose]() {},
      };
    },
  })
);
