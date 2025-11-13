// @ts-ignore
import WASM_PATH from "../public/compiler.wasm";

import { LogLevel, makeCompilerFactory } from "../src/index.js";

const wasmFile = Bun.file(WASM_PATH);

const makeCompiler = await makeCompilerFactory(
  async (imports) =>
    (
      await WebAssembly.instantiate(await wasmFile.arrayBuffer(), imports)
    ).instance
);

const compiler = makeCompiler({
  logger: {
    level: LogLevel.Debug,
    console: globalThis.console,
  },
  stdin: {
    read() {
      return new Uint8Array()
    }
  },
  stdout: {
    write(s) {
      console.log(s);
    },
  },
  stderr: {
    write(s) {
      console.error(s);
    },
  },
});
if (!compiler.ok) {
  throw new Error(compiler.error);
}

const ctrl = new AbortController();
const executor = await compiler.value.createEvaluator<string>(
  ctrl.signal,
  `package main
func Test() string {
  return "test"
}`
);
if (!executor.ok) {
  throw new Error(executor.error);
}

const r = await executor.value(ctrl.signal, "main.Test()");
if (!r.ok) {
  throw new Error(r.error);
}

console.log(r.value);
