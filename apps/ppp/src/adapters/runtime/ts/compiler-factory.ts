import { JsProgram } from "javascript-runtime";
import type { Compiler } from "libs/compiler";
import type { Writer } from "libs/io";
import { redirect, createLogger } from "libs/logger";
import { compileTsModule } from "typescript-runtime";

export class TsCompilerFactory {
  protected readonly patchedConsole: Console;
  constructor(out: Writer) {
    this.patchedConsole = redirect(globalThis.console, createLogger(out));
  }

  create(): Compiler {
    return {
      compile: async (_, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new JsProgram(
          compileTsModule(files[0].content),
          this.patchedConsole
        );
      },
      [Symbol.dispose]() {},
    };
  }
}
