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
      },
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
    }),
  ],
});
