import "../public/wasm_exec.js";
// @ts-ignore
import WASM_PATH from "../public/compiler.wasm";

import { LogLevel, type CompilerConfig } from "../src/model";

import type { Result } from "./result";

declare global {
  function __wasm_init_function(config: CompilerConfig): Result<never>;
}
const WASM_INIT_FUNCTION = "__wasm_init_function";

const wasmFile = Bun.file(WASM_PATH);
const go = new Go();
const source = await WebAssembly.instantiate(
  await wasmFile.arrayBuffer(),
  go.importObject
);
go.argv.push(WASM_INIT_FUNCTION);
void go.run(source.instance);
console.log(globalThis.__wasm_init_function({
  logger: {
    level: LogLevel.Debug,
    console: globalThis.console,
  },
  writer: {
    write (s) {
      console.log(s)
    },
  }
}));
