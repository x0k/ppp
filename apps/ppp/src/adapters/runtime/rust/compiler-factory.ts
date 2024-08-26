import type { Context } from "libs/context";
import { COLOR_ENCODED } from "libs/logger";
import { isErr } from "libs/result";
import type { CompilerFactory } from "compiler";
import { RustProgram, wasiRuntimeFactory } from "rust-runtime";

// @ts-expect-error .wasm is an asset
import miriWasmUrl from "rust-runtime/miri.wasm";

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

export const makeRustCompiler: CompilerFactory = async (ctx, out) => {
  const [miri, libs] = await Promise.all([
    await WebAssembly.compileStreaming(
      fetch(miriWasmUrl, { signal: ctx.signal, cache: "force-cache" })
    ),
    loadLibs(ctx),
  ]);
  const wasi = wasiRuntimeFactory(
    out,
    {
      write: (text) => {
        let r = out.write(COLOR_ENCODED.ERROR);
        if (isErr(r)) {
          return r;
        }
        const r2 = out.write(text);
        if (isErr(r2)) {
          return r2;
        }
        r = out.write(COLOR_ENCODED.RESET);
        if (isErr(r)) {
          return r;
        }
        return r2;
      },
    },
    libs
  );
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new RustProgram(files[0].content, wasi, miri);
    },
    [Symbol.dispose]() {},
  };
};
