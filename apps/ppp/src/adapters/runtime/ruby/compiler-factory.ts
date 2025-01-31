import type { CompilerFactory, Program } from "libs/compiler";
import { RubyProgram, createRubyVM } from "ruby-runtime";

// @ts-expect-error .wasm is an asset
import rubyWasmUrl from "ruby-runtime/ruby.wasm";

export const makeRubyCompiler: CompilerFactory<Program> = async (ctx, streams) => {
  const rubyWasmModule = await WebAssembly.compileStreaming(
    fetch(rubyWasmUrl, { signal: ctx.signal, cache: "force-cache" })
  );
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      const vm = await createRubyVM(ctx, streams, rubyWasmModule);
      return new RubyProgram(files[0].content, vm);
    },
  };
};
