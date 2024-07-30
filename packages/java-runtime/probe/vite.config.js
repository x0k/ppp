import { defineConfig } from "vite";
import inject from "@rollup/plugin-inject";
import replace from '@rollup/plugin-replace';

export default defineConfig({
  define: {
    global: {},
    setImmediate: "setTimeout",
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
    }),
    replace({
      preventAssignment: true,
      include: "browserfs/**/*",
      values: {
        "global.Uint8Array": false,
      }
    }),
  ],
});
