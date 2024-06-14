import { loadPyodide, type PyodideInterface } from "pyodide";
import wasmUrl from "pyodide/pyodide.asm.wasm?url";
import stdLibUrl from "pyodide/python_stdlib.zip?url";
import lockFilerUrl from 'pyodide/pyodide-lock.json?url';
import "pyodide/pyodide.asm.js";

import type { Writer } from "libs/logger";
import { inContext, type Context } from "libs/context";

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

globalThis._createPyodideModule = function (settings: EmscriptenSettings) {
  return originalCreatePyodideModule({
    ...settings,
    instantiateWasm(imports, callback) {
      WebAssembly.instantiateStreaming(fetch(wasmUrl), imports).then(
        ({ instance, module }) => {
          callback(instance, module);
        }
      );
    },
  });
};

export const pyRuntimeFactory = (
  ctx: Context,
  writer: Writer
): Promise<PyodideInterface> =>
  inContext(
    ctx,
    loadPyodide({
      indexURL: "fake-url",
      stdLibURL: stdLibUrl,
      lockFileURL: lockFilerUrl,
      stdout: writer.writeln.bind(writer),
    })
  );
