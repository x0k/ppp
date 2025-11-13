import { loadPyodide, type PyodideInterface } from "pyodide";
import lockFilerUrl from "pyodide/pyodide-lock.json?url";
import "pyodide/pyodide.asm.js";

import { inContext, type Context } from "libs/context";
import { patch } from "libs/patcher";
import { stringifyError } from "libs/error";
import type { Streams } from "libs/io";

interface EmscriptenSettings {
  readonly instantiateWasm?: (
    imports: { [key: string]: any },
    successCallback: (
      instance: WebAssembly.Instance,
      module: WebAssembly.Module
    ) => void
  ) => void;
}

declare global {
  function _createPyodideModule(settings: EmscriptenSettings): Promise<unknown>;
}

const originalCreatePyodideModule = globalThis._createPyodideModule;

export const pyRuntimeFactory = async (
  ctx: Context,
  streams: Streams,
  wasmInstance: (
    ctx: Context,
    imports: WebAssembly.Imports
  ) => Promise<WebAssembly.WebAssemblyInstantiatedSource>,
  stdLibUrl: string
): Promise<PyodideInterface> => {
  using _ = patch(
    globalThis,
    "_createPyodideModule",
    function (settings: EmscriptenSettings) {
      return originalCreatePyodideModule({
        ...settings,
        instantiateWasm(imports, callback) {
          const error_marker = Symbol("error marker");
          imports.sentinel = {
            create_sentinel: () => error_marker,
            is_sentinel: (val: any): val is typeof error_marker =>
              val === error_marker,
          };
          wasmInstance(ctx, imports).then(
            ({ instance, module }) => {
              callback(instance, module);
            },
            (e) => {
              const text = stringifyError(e);
              const encoder = new TextEncoder();
              streams.err.write(encoder.encode(text));
            }
          );
          return {};
        },
      });
    }
  );
  const pyodide = await inContext(
    ctx,
    loadPyodide({
      indexURL: "intentionally-missing-index-url",
      stdLibURL: stdLibUrl,
      lockFileURL: lockFilerUrl,
    })
  );
  pyodide.setStdin({
    stdin: streams.in.read.bind(streams.in),
    autoEOF: false,
  });
  pyodide.setStdout({
    write(data) {
      streams.out.write(data);
      return data.length;
    },
  });
  pyodide.setStderr({
    write(data) {
      streams.err.write(data);
      return data.length;
    },
  });
  return pyodide;
};
