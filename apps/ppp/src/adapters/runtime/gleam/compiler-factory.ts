import { redirect, createLogger } from "libs/logger";
import type { CompilerFactory, Program } from "libs/compiler";
import {
  GleamModuleCompiler,
  type GleamModule,
  GleamProgram,
} from "gleam-runtime";

// @ts-expect-error .wasm is an asset
import compilerWasmUrl from "gleam-runtime/compiler.wasm";
import { compileJsModule } from "libs/js";

const precompiledGleamStdlibIndexUrl = new URL(
  import.meta.env.BASE_URL + "/_astro/gleam",
  globalThis.location.origin
).toString();

export const makeGleamCompiler: CompilerFactory<Program> = async (ctx, streams) => {
  const patchedConsole = redirect(globalThis.console, createLogger(streams.out));
  const compiler = new GleamModuleCompiler(
    streams.out,
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
      const jsModule = await compileJsModule(jsCode);
      if (!jsModule || typeof jsModule !== "object") {
        throw new Error("Compilation failed");
      }
      if (!("main" in jsModule) || typeof jsModule.main !== "function") {
        throw new Error("Main function is missing");
      }
      return new GleamProgram(jsModule as GleamModule, patchedConsole);
    },
  };
};
