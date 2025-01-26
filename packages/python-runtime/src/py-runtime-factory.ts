import { loadPyodide, type PyodideInterface } from "pyodide";
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
  log: Logger,
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
          wasmInstance(ctx, imports).then(
            ({ instance, module }) => {
              callback(instance, module);
            },
            (e) => log.error(stringifyError(e))
          );
        },
      });
    }
  );
  return await inContext(
    ctx,
    loadPyodide({
      indexURL: "intentionally-missing-index-url",
      stdLibURL: stdLibUrl,
      lockFileURL: lockFilerUrl,
      stdout: log.debug.bind(log),
      stderr: log.error.bind(log),
    })
  );
};
