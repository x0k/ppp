import { resolve } from "path";
import { defineConfig, createLogger } from "vite";
import dts from "vite-plugin-dts";

const logger = createLogger();
const loggerWarn = logger.warn;

logger.warn = (msg, options) => {
  // Ignore warnings from pyodide distribution
  if (msg.includes("pyodide/pyodide")) return;
  loggerWarn(msg, options);
};

export default defineConfig({
  customLogger: logger,
  build: {
    commonjsOptions: {
      ignore: () => true,
      ignoreDynamicRequires: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "lib/index.ts"),
        javascript: resolve(__dirname, "lib/javascript/index.ts"),
        typescript: resolve(__dirname, "lib/typescript/index.ts"),
        php: resolve(__dirname, "lib/php/index.ts"),
        python: resolve(__dirname, "lib/python/index.ts"),
      },
      formats: ["es"],
      // name: "MyLib",
      // the proper extensions will be added
      // fileName: "my-lib",
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
