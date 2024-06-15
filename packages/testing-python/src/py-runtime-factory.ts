import { loadPyodide, type PyodideInterface } from "pyodide";
import wasmUrl from "pyodide/pyodide.asm.wasm?url";
import stdLibUrl from "pyodide/python_stdlib.zip?url";
import lockFilerUrl from "pyodide/pyodide-lock.json?url";
import "pyodide/pyodide.asm.js";

import type { Logger } from "libs/logger";
import { inContext, type Context } from "libs/context";
import { patch } from "libs/patcher";
import { stringifyError } from "libs/error";

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
  log: Logger
): Promise<PyodideInterface> => {
  const recover = patch(
    globalThis,
    "_createPyodideModule",
    function (settings: EmscriptenSettings) {
      return originalCreatePyodideModule({
        ...settings,
        instantiateWasm(imports, callback) {
          WebAssembly.instantiateStreaming(fetch(wasmUrl), imports).then(
            ({ instance, module }) => {
              callback(instance, module);
            },
            (e) => log.error(stringifyError(e))
          );
        },
      });
    }
  );
  try {
    return await inContext(
      ctx,
      loadPyodide({
        indexURL: "intentionally-missing-url",
        stdLibURL: stdLibUrl,
        lockFileURL: lockFilerUrl,
        stdout: log.debug.bind(log),
        stderr: log.error.bind(log),
      })
    );
  } finally {
    recover();
  }
};
