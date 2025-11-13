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
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
  plugins: [
    {
      name: "ignore-wasm-imports",
      load(id) {
        if (id.endsWith(".wasm")) {
          return `export default {}`;
        }
      },
    },
    {
      name: "transform-php-imports",
      transform(code, id) {
        if (id.includes("@php-wasm/web/index.js")) {
          return {
            code: code.replace(/await import\(".*php_\d_\d\.js"\)/g, "{}"),
          };
        }
      },
    },
    dts(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@php-wasm/web/php/jspi/8_4_14/php_8_4.wasm",
          dest: ".",
          rename: "php.wasm",
        },
      ],
    }),
  ],
});
