import { createLogger, redirect } from "libs/logger";
import { compileJsModule } from "libs/js";
import type { TestProgramCompiler } from "testing";
import { startTestRunnerActor } from "testing/actor";
import { JsTestProgram } from "javascript-runtime";
import { compileTsModule } from "typescript-runtime";
import { inContext } from "libs/context";

export interface UniversalFactoryData<M, I, O> {
  JsTestProgram: typeof JsTestProgram;
  createLogger: typeof createLogger;
  compileJsModule: typeof compileJsModule;
  compileTsModule: typeof compileTsModule;
  makeTestProgramCompiler: (
    executeTest: (m: M, input: I) => Promise<O>
  ) => TestProgramCompiler<I, O>;
}

startTestRunnerActor<
  unknown,
  unknown,
  UniversalFactoryData<unknown, unknown, unknown>
>((out, universalFactory) =>
  universalFactory({
    JsTestProgram,
    createLogger,
    compileJsModule,
    compileTsModule,
    makeTestProgramCompiler: (invokeTestMethod) => {
      class TestProgram extends JsTestProgram<unknown, unknown, unknown> {
        override async executeTest(
          m: unknown,
          input: unknown
        ): Promise<unknown> {
          return invokeTestMethod(m, input);
        }
      }
      const patchedConsole = redirect(globalThis.console, createLogger(out));
      return {
        async compile(_, files) {
          if (files.length !== 1) {
            throw new Error("Compilation of multiple files is not implemented");
          }
          return new TestProgram(
            await compileJsModule(compileTsModule(files[0].content)),
            patchedConsole
          );
        },
        [Symbol.dispose]() {},
      };
    },
  })
);
