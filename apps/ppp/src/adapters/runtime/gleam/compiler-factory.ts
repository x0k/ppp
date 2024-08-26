import { redirect, createLogger } from "libs/logger";
import type { CompilerFactory } from "compiler";
import { GleamModuleCompiler } from "gleam-runtime";
import { JsProgram } from "javascript-runtime";

// @ts-expect-error .wasm is an asset
import compilerWasmUrl from "gleam-runtime/compiler.wasm";

const precompiledGleamStdlibIndexUrl = new URL(
  import.meta.env.BASE_URL + "/_astro/gleam",
  globalThis.location.origin
).toString();

export const makeGleamCompiler: CompilerFactory = async (ctx, out) => {
  const patchedConsole = redirect(globalThis.console, createLogger(out));
  const compiler = new GleamModuleCompiler(
    out,
    precompiledGleamStdlibIndexUrl,
    await WebAssembly.compileStreaming(
      fetch(compilerWasmUrl, { signal: ctx.signal })
    )
  );
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      const jsCode = compiler.compile(files[0].content);
      return new JsProgram(jsCode, patchedConsole);
    },
    [Symbol.dispose]() {},
  };
};
