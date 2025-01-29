import { redirect, createLogger } from "libs/logger";
import type { CompilerFactory, Program } from "compiler";
import { JsProgram } from "javascript-runtime";

export const makeJsCompiler: CompilerFactory<Program> = async (_, streams) => {
  const patchedConsole = redirect(globalThis.console, createLogger(streams.out));
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new JsProgram(files[0].content, patchedConsole);
    },
  };
};
