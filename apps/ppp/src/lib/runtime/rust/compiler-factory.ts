import type { Context } from "libs/context";
import type { CompilerFactory, Program } from "libs/compiler";
import { RustProgram, createWASI } from "rust-runtime";

import miriWasmUrl from "rust-runtime/miri.wasm?url";

const libsUrls = import.meta.glob("/node_modules/rust-runtime/dist/lib/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

// TODO: manual cache for large assets
function loadLibs(ctx: Context) {
  return Promise.all(
    Object.entries(libsUrls).map(async ([lib, url]) => {
      const response = await fetch(url, {
        signal: ctx.signal,
        cache: "force-cache",
      });
      const buffer = await response.arrayBuffer();
      return [lib.slice(36), buffer] as [string, ArrayBuffer];
    })
  );
}

export const makeRustCompiler: CompilerFactory<Program> = async (
  ctx,
  streams
) => {
  const [miri, libs] = await Promise.all([
    await WebAssembly.compileStreaming(
      fetch(miriWasmUrl, { signal: ctx.signal, cache: "force-cache" })
    ),
    loadLibs(ctx),
  ]);
  const wasi = createWASI(streams, libs);
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new RustProgram(files[0].content, wasi, miri);
    },
  };
};
