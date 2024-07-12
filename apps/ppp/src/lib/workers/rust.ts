import { COLOR_ENCODED } from "libs/logger";
import type { Context } from "libs/context";
import { isErr } from "libs/result";
import type { TestRunnerFactory } from "testing";
import { startTestRunnerActor } from "testing/actor";
import { RustTestRunner, wasiRuntimeFactory } from "rust-runtime";

// @ts-expect-error .wasm is an asset
import miriWasmUrl from "rust-runtime/miri.wasm";

const libsUrls = import.meta.glob("/node_modules/testing-rust/dist/lib/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export interface RustUniversalFactoryData<I, O> {
  RustTestRunner: typeof RustTestRunner;
  wasiRuntimeFactory: typeof wasiRuntimeFactory;
  makeTestRunnerFactory: (
    generateOutputContentCode: (input: I) => string,
    transformResult: (result: string) => O
  ) => TestRunnerFactory<I, O>;
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

startTestRunnerActor<
  unknown,
  unknown,
  RustUniversalFactoryData<unknown, unknown>
>((universalFactory) =>
  universalFactory({
    RustTestRunner,
    wasiRuntimeFactory,
    makeTestRunnerFactory: (generateOutputContentCode, transformResult) => {
      class TestRunner extends RustTestRunner<unknown, unknown> {
        protected override generateOutputContentCode(input: unknown): string {
          return generateOutputContentCode(input);
        }
        protected override transformResult(data: string): unknown {
          return transformResult(data);
        }
      }
      return async (ctx, { code, out }) =>
        new TestRunner(
          code,
          wasiRuntimeFactory(
            out,
            {
              write(text) {
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
            await loadLibs(ctx)
          ),
          await WebAssembly.compileStreaming(
            fetch(miriWasmUrl, { signal: ctx.signal, cache: "force-cache" })
          ),
          "case_output"
        );
    },
  })
);
