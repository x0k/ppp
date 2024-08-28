import { DefaultRubyVM } from "@ruby/wasm-wasi/dist/browser";

// @ts-expect-error
import WASM_PATH from "./public/ruby+stdlib.wasm";

const wasmFile = Bun.file(WASM_PATH);

const { vm } = await DefaultRubyVM(
  await WebAssembly.compile(await wasmFile.arrayBuffer()),
  {
    consolePrint: true
  }
);

vm.eval("puts 'hello world'");
vm.printVersion()