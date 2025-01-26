import {
  GoProgram,
  makeCompilerFactory,
  makeGoCompilerFactory,
  makeGoExecutorFactory,
} from "go-runtime";
import type { CompilerFactory } from "compiler";
import { inContext } from "libs/context";

import wasmInit from "go-runtime/compiler.wasm?init";

export const makeGoCompiler: CompilerFactory = async (ctx, out) => {
  const goExecutorFactory = makeGoExecutorFactory(
    makeGoCompilerFactory(
      await makeCompilerFactory((imports) => inContext(ctx, wasmInit(imports)))
    )
  );
  return {
    async compile(ctx, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new GoProgram(await goExecutorFactory(ctx, out, files[0].content));
    },
  };
};
