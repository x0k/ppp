import type { CompilerFactory } from "compiler";
import { makeErrorWriter } from "libs/io";
import { RubyProgram, createRubyVM } from "ruby-runtime";

// @ts-expect-error .wasm is an asset
import rubyWasmUrl from "ruby-runtime/ruby.wasm";

export const makeRubyCompiler: CompilerFactory = async (ctx, out) => {
  const rubyWasmModule = await WebAssembly.compileStreaming(
    fetch(rubyWasmUrl, { signal: ctx.signal, cache: "force-cache" })
  );
  const errorWriter = makeErrorWriter(out);
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      const vm = await createRubyVM(ctx, out, errorWriter, rubyWasmModule);
      return new RubyProgram(files[0].content, vm);
    },
  };
};
