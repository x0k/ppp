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
  makeTestRunnerFactory: (
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
    makeTestRunnerFactory: (executeTest) => {
      class TestRunner extends JsTestProgram<unknown, unknown, unknown> {
        override async executeTest(
          m: unknown,
          input: unknown
        ): Promise<unknown> {
          return executeTest(m, input);
        }
      }
      return {
        async compile(ctx, files) {
          return new TestRunner(
            await inContext(ctx, compileJsModule(files[0].content)),
            redirect(globalThis.console, createLogger(out))
          );
        },
        [Symbol.dispose]() {},
      };
    },
  })
);
