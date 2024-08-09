import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/index.ts"], // Adjust this to your main entry point
    inject: ["src/bfs-shim.js"],
    bundle: true,
    outfile: "dist/bundle.js", // Adjust the output file as needed
    format: "esm",
    target: "es2022",
    define: {
      global: "{}",
      setImmediate: "queueMicrotask",
    },
    loader: {
      ".java": "text"
    },
    alias: {
      buffer: "browserfs/dist/shims/buffer",
      fs: "browserfs/dist/shims/fs",
      path: "browserfs/dist/shims/path",
      processGlobal: "browserfs/dist/shims/process.js",
      bufferGlobal: "browserfs/dist/shims/bufferGlobal.js",
      bfsGlobal: "browserfs",
    },
  })
  .catch(() => process.exit(1));
