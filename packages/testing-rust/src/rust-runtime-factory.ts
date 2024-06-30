import {
  WASI,
  ConsoleStdout,
  Fd,
  PreopenDirectory,
  File,
  Directory,
} from "@bjorn3/browser_wasi_shim";
import type { Writer } from "libs/logger";

import { contents, dir } from "./wasi.js";

function makeWritable(writer: Writer) {
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return new ConsoleStdout((buffer) => {
    const data = decoder.decode(buffer, { stream: true });
    writer.write(data);
  });
}

export function wasiRuntimeFactory(
  stdout: Writer,
  stderr: Writer,
  libs: [string, ArrayBuffer][]
): WASI {
  const env: string[] = [];
  const args = [
    "miri",
    "--sysroot",
    "/sysroot",
    "main.rs",
    "--target",
    "x86_64-unknown-linux-gnu",
    // "-Zmir-opt-level=3",
    "-Zmiri-ignore-leaks",
    "-Zmiri-permissive-provenance",
    "-Zmiri-preemption-rate=0",
    "-Zmiri-disable-alignment-check",
    "-Zmiri-disable-data-race-detector",
    "-Zmiri-disable-stacked-borrows",
    "-Zmiri-disable-validation",
    "-Zmir-emit-retag=false",
    "-Zmiri-disable-isolation",
    "-Zmiri-panic-on-unsupported",
    "--color=always",
  ];
  const tmpDir = new PreopenDirectory("/tmp", contents({}));
  const sysrootDir = new PreopenDirectory(
    "/sysroot",
    contents({
      lib: dir({
        rustlib: dir({
          "wasm32-wasi": dir({ lib: dir({}) }),
          "x86_64-unknown-linux-gnu": dir({
            lib: new Directory(
              libs.map(
                ([lib, buffler]) => [lib, new File(buffler)] as [string, File]
              )
            ),
          }),
        }),
      }),
    })
  );
  const rootDir = new PreopenDirectory(
    "/",
    contents({
      "main.rs": new File([]),
    })
  );
  const descriptors: Array<Fd> = [
    new ConsoleStdout(() => {
      throw new Error("Stdin is not implemented");
    }),
    makeWritable(stdout),
    makeWritable(stderr),
    tmpDir,
    sysrootDir,
    rootDir,
  ];
  return new WASI(args, env, descriptors, { debug: false });
}
