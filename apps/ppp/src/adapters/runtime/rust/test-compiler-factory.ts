import type { Context } from "libs/context";
import { COLOR_ENCODED } from "libs/logger";
import { isErr } from "libs/result";
import type { Writer } from "libs/io";
import type { TestProgramCompiler } from "testing";
import { RustTestProgram, wasiRuntimeFactory } from "rust-runtime";

// @ts-expect-error .wasm is an asset
import miriWasmUrl from "rust-runtime/miri.wasm";

const libsUrls = import.meta.glob("/node_modules/testing-rust/dist/lib/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export interface RustUniversalFactoryData<I, O> {
  RustTestProgram: typeof RustTestProgram;
  wasiRuntimeFactory: typeof wasiRuntimeFactory;
  makeTestProgramCompiler: (
    ctx: Context,
    generateOutputContentCode: (input: I) => string,
    transformResult: (result: string) => O
  ) => Promise<TestProgramCompiler<I, O>>;
}

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
  ): Promise<TestProgramCompiler<I, O>> {
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
    const wasi = wasiRuntimeFactory(
      this.out,
      {
        write: (text) => {
          let r = this.out.write(COLOR_ENCODED.ERROR);
          if (isErr(r)) {
            return r;
          }
          const r2 = this.out.write(text);
          if (isErr(r2)) {
            return r2;
          }
          r = this.out.write(COLOR_ENCODED.RESET);
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
        return new TestProgram(files[0].content, wasi, miri, "case_output");
      },
      [Symbol.dispose]() {},
    };
  }
}
