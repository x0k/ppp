import {
  WASI,
  ConsoleStdout,
  Fd,
  PreopenDirectory,
  File,
  Directory,
} from "@bjorn3/browser_wasi_shim";
import type { Streams } from "libs/io";

import { contents, dir } from "./wasi.js";

export function createWASI(
  streams: Streams,
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
                ([lib, buffer]) => [lib, new File(buffer)] as [string, File]
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
    new ConsoleStdout(streams.out.write.bind(streams.out)),
    new ConsoleStdout(streams.err.write.bind(streams.err)),
    tmpDir,
    sysrootDir,
    rootDir,
  ];
  return new WASI(args, env, descriptors, { debug: false });
}
