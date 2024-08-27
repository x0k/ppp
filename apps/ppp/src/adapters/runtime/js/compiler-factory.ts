import { redirect, createLogger } from "libs/logger";
import type { CompilerFactory } from "compiler";
import { JsProgram } from "javascript-runtime";

export const makeJsCompiler: CompilerFactory = async (_, out) => {
  const patchedConsole = redirect(globalThis.console, createLogger(out));
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new JsProgram(files[0].content, patchedConsole);
    },
    [Symbol.dispose]() {},
  };
};
