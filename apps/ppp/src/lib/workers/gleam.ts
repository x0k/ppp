import { compileJsModule } from "libs/js";
import { createLogger } from "libs/logger";
import type { TestRunnerFactory } from "testing";
import { JsTestRunner } from "testing-javascript";
import { GleamModuleCompiler } from "testing-gleam";

// @ts-expect-error .wasm is an asset
import compilerWasmUrl from "testing-gleam/compiler.wasm";
import { startTestRunnerActor } from "testing/actor";

const precompiledGleamStdlibIndexUrl = new URL(
  import.meta.env.BASE_URL + "/_astro/gleam",
  globalThis.location.origin
).toString();

export interface GleamUniversalFactoryData<M, I, O> {
  JsTestRunner: typeof JsTestRunner;
  createLogger: typeof createLogger;
  compileJsModule: typeof compileJsModule;
  GleamModuleCompiler: typeof GleamModuleCompiler;
  precompiledGleamStdlibIndexUrl: string;
  makeTestRunnerFactory: (
    executeTest: (m: M, input: I) => Promise<O>
  ) => TestRunnerFactory<I, O>;
}

startTestRunnerActor<
  unknown,
  unknown,
  GleamUniversalFactoryData<unknown, unknown, unknown>
>((universalFactory) =>
  universalFactory({
    JsTestRunner,
    createLogger,
    compileJsModule,
    GleamModuleCompiler,
    precompiledGleamStdlibIndexUrl,
    makeTestRunnerFactory: (executeTest) => {
      class TestRunner extends JsTestRunner<unknown, unknown, unknown> {
        override async executeTest(
          m: unknown,
          input: unknown
        ): Promise<unknown> {
          return executeTest(m, input);
        }
      }
      return async (_, { code, out }) => {
        const jsCode = new GleamModuleCompiler(
          out,
          precompiledGleamStdlibIndexUrl,
          await WebAssembly.compileStreaming(fetch(compilerWasmUrl))
        ).compile(code);
        return new TestRunner(createLogger(out), await compileJsModule(jsCode));
      };
    },
  })
);
