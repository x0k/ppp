import type { CompilerFactory, Program } from "compiler";
import { PyProgram, pyRuntimeFactory } from "python-runtime";

// @ts-ignore
import wasmUrl from "python-runtime/pyodide.wasm";
// @ts-ignore
import stdlibUrl from "python-runtime/python-stdlib.zip";

export const makePythonCompiler: CompilerFactory<Program> = async (ctx, streams) => {
  const pyRuntime = await pyRuntimeFactory(
    ctx,
    streams,
    (ctx, imports) =>
      WebAssembly.instantiateStreaming(
        fetch(wasmUrl, { signal: ctx.signal }),
        imports
      ),
    stdlibUrl
  );
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new PyProgram(files[0].content, pyRuntime);
    },
  };
};
