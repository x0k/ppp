import {
  Fd,
  File,
  Directory,
  PreopenDirectory,
  WASI,
  Inode,
  wasi as wasiDefs,
} from "@bjorn3/browser_wasi_shim";
import { readdir } from "node:fs/promises";

const miriFile = Bun.file(new URL("../public/miri.wasm", import.meta.url));

const libs = await readdir(new URL("../public/lib", import.meta.url));

function dirContent(data: Record<string, Inode>) {
  return new Map(Object.entries(data));
}

function dir(data: Record<string, Inode>) {
  return new Directory(dirContent(data));
}

function buildSysroot(lib: Directory): PreopenDirectory {
  // Create SYSROOT directory for Miri
  return new PreopenDirectory(
    "/sysroot",
    dirContent({
      lib: dir({
        rustlib: dir({
          "wasm32-wasi": dir({ lib: dir({}) }),
          "x86_64-unknown-linux-gnu": dir({
            lib: lib,
          }),
        }),
      }),
    })
  );
}

async function loadLib(lib: string): Promise<[string, File]> {
  return [
    lib,
    new File(
      await Bun.file(
        new URL(`../public/lib/${lib}`, import.meta.url)
      ).arrayBuffer()
    ),
  ];
}

async function loadLibs(libs: string[]) {
  return new Directory(await Promise.all(libs.map(loadLib)));
}

class Stdio extends Fd {
  private out: Uint8Array[];

  constructor(out: Uint8Array[] = []) {
    super();
    this.out = out;
  }

  fd_write(data: Uint8Array): { ret: number; nwritten: number } {
    this.out.push(data);
    return { ret: 0, nwritten: data.byteLength };
  }

  clear() {
    this.out.length = 0;
  }

  text(): string {
    const decoder = new TextDecoder("utf-8");
    let string = "";
    for (const b of this.out) {
      string += decoder.decode(b);
    }
    return string;
  }
}

const miriModule = await WebAssembly.compile(await miriFile.arrayBuffer());
const out: Uint8Array[] = [];
const stdin = new Stdio(out);
const stdout = new Stdio(out);
const stderr = new Stdio(out);
const tmp = new PreopenDirectory("/tmp", dirContent({}));
const sysroot = buildSysroot(await loadLibs(libs));
const code = await Bun.file(new URL("./code.rs", import.meta.url)).text();
const mainFile = new File(new TextEncoder().encode(code));
const root = new PreopenDirectory(
  "/",
  dirContent({
    "main.rs": mainFile,
  })
);
const descriptors = [stdin, stdout, stderr, tmp, sysroot, root];
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
const wasi = new WASI(args, env, descriptors, { debug: false });
let thread_id = 1;
const miri = await WebAssembly.instantiate(miriModule, {
  env: {
    memory: new WebAssembly.Memory({
      initial: 256,
      // maximum: 1024 * 4,
      shared: false,
    }),
  },
  wasi: {
    // @ts-ignore
    "thread-spawn": (start_arg) => {
      let id = thread_id++;
      // @ts-ignore
      miri.exports.wasi_thread_start(id, start_arg);
      return id;
    },
  },
  wasi_snapshot_preview1: wasi.wasiImport,
});

try {
  // @ts-ignore
  wasi.start(miri);
} catch (e) {
  console.error(e);
}

console.log(stdout.text());

const node = root.path_lookup("foo.txt", 0).inode_obj;
if (node === null || !(node instanceof File)) {
  throw new Error("foo.txt not found");
}
console.log(new TextDecoder().decode(node.data));
