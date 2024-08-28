import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        version: resolve(__dirname, "src/version.ts"),
      },
      formats: ["es"],
      // name: "MyLib",
      // the proper extensions will be added
      // fileName: "index",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [/^libs\//],
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
          src: "node_modules/@ruby/3.3-wasm-wasi/dist/ruby+stdlib.wasm",
          dest: ".",
          rename: "ruby.wasm",
        },
      ],
    }),
  ],
});
