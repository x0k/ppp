import type { Context } from "libs/context";
import type { Writer } from "libs/io";
import { redirect, createLogger } from "libs/logger";
import type { Compiler } from "compiler";
import { GleamModuleCompiler } from "gleam-runtime";
import { JsProgram } from "javascript-runtime";

// @ts-expect-error .wasm is an asset
import compilerWasmUrl from "gleam-runtime/compiler.wasm";

const precompiledGleamStdlibIndexUrl = new URL(
  import.meta.env.BASE_URL + "/_astro/gleam",
  globalThis.location.origin
).toString();

export class GleamCompilerFactory {
  protected readonly patchedConsole: Console;
  constructor(protected readonly out: Writer) {
    this.patchedConsole = redirect(globalThis.console, createLogger(out));
  }

  async create(ctx: Context): Promise<Compiler> {
    const compiler = new GleamModuleCompiler(
      this.out,
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
        return new JsProgram(jsCode, this.patchedConsole);
      },
      [Symbol.dispose]() {},
    };
  }
}
