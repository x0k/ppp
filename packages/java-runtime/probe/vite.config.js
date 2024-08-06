import { defineConfig } from "vite";
import inject from "@rollup/plugin-inject";

export default defineConfig({
  define: {
    global: {},
    setImmediate: "queueMicrotask",
  },
  resolve: {
    alias: {
      buffer: "browserfs/dist/shims/buffer",
      fs: "browserfs/dist/shims/fs",
      path: "browserfs/dist/shims/path",
      processGlobal: "browserfs/dist/shims/process.js",
      bufferGlobal: "browserfs/dist/shims/bufferGlobal.js",
      bfsGlobal: "browserfs",
    },
  },
  build: {
    target: "es2022",
    // commonjsOptions: {
    //   transformMixedEsModules: true,
    //   include: ["src/**/*"],
    // },
  },
  plugins: [
    inject({
      BrowserFS: "/src/bfs.js",
      process: "/src/bfs-process.js",
      setImmediate: '/src/set-immediate.js',
    }),
  ],
});
