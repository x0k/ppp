// @ts-ignore
import WASM_PATH from "../public/compiler.wasm";

import { LogLevel, createCompilerFactory } from "../src/index.js";

const wasmFile = Bun.file(WASM_PATH);

const factory = await createCompilerFactory(
  async (imports) =>
    (
      await WebAssembly.instantiate(await wasmFile.arrayBuffer(), imports)
    ).instance
);

const compiler = factory({
  logger: {
    level: LogLevel.Debug,
    console: globalThis.console,
  },
  writer: {
    write(s) {
      console.log(s);
    },
  },
});
if (!compiler.ok) {
  throw new Error(compiler.error);
}

const ctrl = new AbortController();
const executor = compiler.value.compile<string>(
  ctrl.signal,
  `package main
func Test() string {
  return "test"
}`
);
if (!executor.ok) {
  throw new Error(executor.error);
}

const r = executor.value(ctrl.signal, "main.Test()");
if (!r.ok) {
  throw new Error(r.error);
}

console.log(r.value);
