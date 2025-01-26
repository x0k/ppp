import type { Context } from "libs/context";
import { makeErrorWriter, type Writer } from "libs/io";
import type { TestCompiler } from "testing";
import { RustTestProgram, createWASI } from "rust-runtime";

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

export type GenerateOutputContentCode<I> = (input: I) => string;
export type TransformResult<O> = (result: string) => O;

export class RustTestCompilerFactory {
  constructor(protected readonly out: Writer) {}

  async create<I, O>(
    ctx: Context,
    generateOutputContentCode: GenerateOutputContentCode<I>,
    transformResult: TransformResult<O>
  ): Promise<TestCompiler<I, O>> {
    class TestProgram extends RustTestProgram<I, O> {
      protected override generateOutputContentCode(input: I): string {
        return generateOutputContentCode(input);
      }
      protected override transformResult(data: string): O {
        return transformResult(data);
      }
    }
    const [miri, libs] = await Promise.all([
      await WebAssembly.compileStreaming(
        fetch(miriWasmUrl, { signal: ctx.signal, cache: "force-cache" })
      ),
      loadLibs(ctx),
    ]);
    const wasi = createWASI(this.out, makeErrorWriter(this.out), libs);
    return {
      async compile(_, files) {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new TestProgram(files[0].content, wasi, miri, "case_output");
      },
    };
  }
}
