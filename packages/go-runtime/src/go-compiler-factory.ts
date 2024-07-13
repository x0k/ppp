import "./vendor/wasm_exec.js";

import { DEFAULT_GLOBAL_COMPILER_INIT_FUNCTION_NAME, type CompilerFactory } from "./model.js";

export async function createCompilerFactory(
  instantiate: (
    importObject: WebAssembly.Imports
  ) => Promise<WebAssembly.Instance>,
  globalCompilerInitFunctionName = DEFAULT_GLOBAL_COMPILER_INIT_FUNCTION_NAME
): Promise<CompilerFactory> {
  const go = new Go();
  go.argv.push(globalCompilerInitFunctionName);
  void go.run(await instantiate(go.importObject));
  // @ts-ignore
  const factory = globalThis[globalCompilerInitFunctionName] as CompilerFactory;
  return factory;
}
