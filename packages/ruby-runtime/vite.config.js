import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        version: resolve(import.meta.dirname, "src/version.ts"),
      },
      formats: ["es"],
      // name: "MyLib",
      // the proper extensions will be added
      // fileName: "index",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [/^libs\//, "@bjorn3/browser_wasi_shim"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          // vue: "Vue",
        },
      },
    },
  },
  plugins: [
    dts(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@ruby/4.0-wasm-wasi/dist/ruby+stdlib.wasm",
          dest: ".",
          rename: { stripBase: true, name: "ruby.wasm" },
        },
      ],
    }),
  ],
});
