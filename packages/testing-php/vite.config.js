import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      // name: "MyLib",
      // the proper extensions will be added
      fileName: "index",
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
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
  assetsInclude: ["**/light/8_3_0/php_8_3.wasm"],
  plugins: [
    {
      name: "ignore-wasm-imports",
      load(id) {
        if (id?.endsWith(".wasm")) {
          return {
            code: "export default {}",
            map: null,
          };
        }
      },
    },
    dts({
      rollupTypes: true,
    }),
  ],
});
