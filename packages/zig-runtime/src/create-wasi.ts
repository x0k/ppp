import {
  ConsoleStdout,
  Inode,
  PreopenDirectory,
  WASI,
  File,
} from "@bjorn3/browser_wasi_shim";
import type { Streams } from "libs/io";
import { Stdin } from "libs/wasi";

export interface CompilerWASIOptions {
  streams: Streams;
  source: string;
  libCompilerRt: ArrayBuffer;
}
const compilerArgs = [
  "zig.wasm",
  "build-exe",
  "main.zig",
  "libcompiler_rt.a",
  "-fno-compiler-rt", // manually linked because the self hosted webassembly backend cannot compile it by itself
  "-fno-entry", // prevent the native webassembly backend from adding a start function to the module
];
const compilerEnv: string[] = [];
const textEncoder = new TextEncoder();
export function createCompilerWASI({
  streams,
  source,
  libCompilerRt,
}: CompilerWASIOptions) {
  const descriptors = [
    new Stdin(streams.in.read.bind(streams.in)),
    new ConsoleStdout(streams.out.write.bind(streams.out)),
    new ConsoleStdout(streams.err.write.bind(streams.err)),
    new PreopenDirectory(
      ".",
      new Map<string, Inode>([
        ["main.zig", new File(textEncoder.encode(source))],
        ["libcompiler_rt.a", new File(libCompilerRt)],
      ]),
    ),
    new PreopenDirectory("/lib", new Map()),
    new PreopenDirectory("/cache", new Map()),
  ];
  return new WASI(compilerArgs, compilerEnv, descriptors, { debug: false });
}

const programArgs = ["main.wasm"];
const programEnv: string[] = [];
export function createProgramWASI(streams: Streams) {
  const descriptors = [
    new Stdin(streams.in.read.bind(streams.in)),
    new ConsoleStdout(streams.out.write.bind(streams.out)),
    new ConsoleStdout(streams.err.write.bind(streams.err)),
    new PreopenDirectory(".", new Map()),
  ];
  return new WASI(programArgs, programEnv, descriptors, { debug: false });
}
