import {
  ConsoleStdout,
  Inode,
  PreopenDirectory,
  WASI,
  File,
  Directory,
} from "@bjorn3/browser_wasi_shim";
import type { Streams } from "libs/io";
import { Stdin } from "libs/wasi";

interface FileData {
  path: string[];
  data: Uint8Array;
}

function convert(files: FileData[], i = 0): Directory {
  const data = new Map<string, File | Directory>();
  while (files.length > 0) {
    const toConvert: FileData[] = [];
    let wIndex = 0;
    let key: string | undefined = undefined;
    for (let rIndex = 0; rIndex < files.length; rIndex++) {
      const f = files[rIndex];
      if (f.path.length <= i) {
        throw new Error(`Path too short at index ${i}: ${f.path}`);
      } else if (f.path.length - 1 === i) {
        data.set(f.path[i], new File(f.data));
      } else if (key === undefined) {
        key = f.path[i];
        toConvert.push(f);
      } else if (f.path[i] === key) {
        toConvert.push(f);
      } else {
        files[wIndex++] = files[rIndex];
      }
    }
    files.length = wIndex;
    if (toConvert.length > 0) {
      data.set(key!, convert(toConvert, i + 1));
    }
  }
  return new Directory(data);
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
const LIB_PREFIX = "lib/";
export function createCompilerWASI(
  streams: Streams,
  libCompilerRt: ArrayBuffer,
  stdLibFiles: {
    filename: string;
    fileData: Uint8Array;
  }[],
) {
  const files: FileData[] = [];
  for (const f of stdLibFiles) {
    if (!f.filename.startsWith(LIB_PREFIX)) {
      continue;
    }
    const path = f.filename.slice(LIB_PREFIX.length).split("/");
    files.push({ path, data: f.fileData });
  }
  const descriptors = [
    new Stdin(streams.in.read.bind(streams.in)),
    new ConsoleStdout(streams.out.write.bind(streams.out)),
    new ConsoleStdout(streams.err.write.bind(streams.err)),
    new PreopenDirectory(
      ".",
      new Map<string, Inode>([
        ["main.zig", new File([])],
        ["libcompiler_rt.a", new File(libCompilerRt)],
      ]),
    ),
    new PreopenDirectory("/lib", convert(files).contents),
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
