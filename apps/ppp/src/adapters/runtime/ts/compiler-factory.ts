import { JsProgram } from "javascript-runtime";
import type { CompilerFactory } from "compiler";
import { redirect, createLogger } from "libs/logger";
import { compileTsModule } from "typescript-runtime";

export const makeTsCompiler: CompilerFactory = async (_, out) => {
  const patchedConsole = redirect(globalThis.console, createLogger(out));
  return {
    async compile (_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new JsProgram(
        compileTsModule(files[0].content),
        patchedConsole
      );
    },
  };
};
