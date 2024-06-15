import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  worker: {
    format: "es",
  },
  // Workers support in lib mode
  // https://github.com/vitejs/vite/discussions/15547#discussioncomment-8950765
  base: "./",
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        js: resolve(__dirname, "src/js/index.ts"),
        ts: resolve(__dirname, "src/ts/index.ts"),
        php: resolve(__dirname, "src/php/index.ts"),
        python: resolve(__dirname, "src/python/index.ts"),
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
    dts({
      rollupTypes: true,
    }),
  ],
});
