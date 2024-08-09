import esbuild from "esbuild";
import fs from "fs/promises";
import { exec } from "child_process";

await fs.rm("dist", { recursive: true, force: true });
await fs.rm("tsconfig.tsbuildinfo", { force: true });

console.log("Build main bundle...");
await esbuild
  .build({
    outdir: "dist",
    entryPoints: ["src/index.ts"],
    bundle: true,
    sourcemap: "external",
    inject: ["src/bfs-shim.js"],
    format: "esm",
    target: "es2022",
    define: {
      global: "{}",
      setImmediate: "queueMicrotask",
    },
    alias: {
      buffer: "browserfs/dist/shims/buffer",
      fs: "browserfs/dist/shims/fs",
      path: "browserfs/dist/shims/path",
      processGlobal: "browserfs/dist/shims/process.js",
      bufferGlobal: "browserfs/dist/shims/bufferGlobal.js",
      bfsGlobal: "browserfs",
    },
    external: ["libs/*"],
  })
  .catch(() => process.exit(1));

console.log("Build version bundle...");
await esbuild.build({
  outdir: "dist",
  entryPoints: ["src/version.ts"],
  bundle: true,
  sourcemap: "external",
  format: "esm",
  target: "es2022",
});

console.log("Generate typescript definitions...");
await new Promise((resolve, reject) => {
  exec("npx tsc", (error) => {
    if (error) {
      reject(error);
      return;
    }
    resolve();
  });
});

console.log("Copy doppio.zip...");
await fs.cp("src/vendor/doppio.zip", "dist/doppio/doppio.zip", { force: true });
