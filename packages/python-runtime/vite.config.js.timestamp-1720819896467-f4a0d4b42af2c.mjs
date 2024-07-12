// vite.config.js
import { resolve } from "path";
import { defineConfig, createLogger } from "file:///home/roman/Projects/ppp/node_modules/.pnpm/vite@5.3.3_@types+node@20.14.2/node_modules/vite/dist/node/index.js";
import dts from "file:///home/roman/Projects/ppp/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.14.2_rollup@4.18.0_typescript@5.5.3_vite@5.3.3_@types+node@20.14.2_/node_modules/vite-plugin-dts/dist/index.mjs";
import { viteStaticCopy } from "file:///home/roman/Projects/ppp/node_modules/.pnpm/vite-plugin-static-copy@1.0.6_vite@5.3.3_@types+node@20.14.2_/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_dirname = "/home/roman/Projects/ppp/packages/python-runtime";
var logger = createLogger();
var loggerWarn = logger.warn;
logger.warn = (msg, options) => {
  if (msg.includes("pyodide/pyodide")) return;
  loggerWarn(msg, options);
};
var vite_config_default = defineConfig({
  customLogger: logger,
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__vite_injected_original_dirname, "src/index.ts"),
        version: resolve(__vite_injected_original_dirname, "src/version.ts")
      },
      formats: ["es"]
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
        }
      }
    }
  },
  plugins: [
    dts(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/pyodide/pyodide.asm.wasm",
          dest: "pyodide"
        },
        {
          src: "node_modules/pyodide/python_stdlib.zip",
          dest: "pyodide"
        }
      ]
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9yb21hbi9Qcm9qZWN0cy9wcHAvcGFja2FnZXMvcHl0aG9uLXJ1bnRpbWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3JvbWFuL1Byb2plY3RzL3BwcC9wYWNrYWdlcy9weXRob24tcnVudGltZS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9yb21hbi9Qcm9qZWN0cy9wcHAvcGFja2FnZXMvcHl0aG9uLXJ1bnRpbWUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgY3JlYXRlTG9nZ2VyIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCBkdHMgZnJvbSBcInZpdGUtcGx1Z2luLWR0c1wiO1xuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tIFwidml0ZS1wbHVnaW4tc3RhdGljLWNvcHlcIjtcblxuY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKCk7XG5jb25zdCBsb2dnZXJXYXJuID0gbG9nZ2VyLndhcm47XG5cbmxvZ2dlci53YXJuID0gKG1zZywgb3B0aW9ucykgPT4ge1xuICAvLyBJZ25vcmUgd2FybmluZ3MgZnJvbSBweW9kaWRlIGRpc3RyaWJ1dGlvblxuICBpZiAobXNnLmluY2x1ZGVzKFwicHlvZGlkZS9weW9kaWRlXCIpKSByZXR1cm47XG4gIGxvZ2dlcldhcm4obXNnLCBvcHRpb25zKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGN1c3RvbUxvZ2dlcjogbG9nZ2VyLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgLy8gQ291bGQgYWxzbyBiZSBhIGRpY3Rpb25hcnkgb3IgYXJyYXkgb2YgbXVsdGlwbGUgZW50cnkgcG9pbnRzXG4gICAgICBlbnRyeToge1xuICAgICAgICBpbmRleDogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjL2luZGV4LnRzXCIpLFxuICAgICAgICB2ZXJzaW9uOiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvdmVyc2lvbi50c1wiKSxcbiAgICAgIH0sXG4gICAgICBmb3JtYXRzOiBbXCJlc1wiXSxcbiAgICAgIC8vIG5hbWU6IFwiTXlMaWJcIixcbiAgICAgIC8vIHRoZSBwcm9wZXIgZXh0ZW5zaW9ucyB3aWxsIGJlIGFkZGVkXG4gICAgICAvLyBmaWxlTmFtZTogXCJpbmRleFwiLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgLy8gbWFrZSBzdXJlIHRvIGV4dGVybmFsaXplIGRlcHMgdGhhdCBzaG91bGRuJ3QgYmUgYnVuZGxlZFxuICAgICAgLy8gaW50byB5b3VyIGxpYnJhcnlcbiAgICAgIGV4dGVybmFsOiBbL15saWJzXFwvL10sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgLy8gUHJvdmlkZSBnbG9iYWwgdmFyaWFibGVzIHRvIHVzZSBpbiB0aGUgVU1EIGJ1aWxkXG4gICAgICAgIC8vIGZvciBleHRlcm5hbGl6ZWQgZGVwc1xuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgLy8gdnVlOiBcIlZ1ZVwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgZHRzKCksXG4gICAgdml0ZVN0YXRpY0NvcHkoe1xuICAgICAgdGFyZ2V0czogW1xuICAgICAgICB7XG4gICAgICAgICAgc3JjOiBcIm5vZGVfbW9kdWxlcy9weW9kaWRlL3B5b2RpZGUuYXNtLndhc21cIixcbiAgICAgICAgICBkZXN0OiBcInB5b2RpZGVcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHNyYzogXCJub2RlX21vZHVsZXMvcHlvZGlkZS9weXRob25fc3RkbGliLnppcFwiLFxuICAgICAgICAgIGRlc3Q6IFwicHlvZGlkZVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVSxTQUFTLGVBQWU7QUFDMVYsU0FBUyxjQUFjLG9CQUFvQjtBQUMzQyxPQUFPLFNBQVM7QUFDaEIsU0FBUyxzQkFBc0I7QUFIL0IsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxTQUFTLGFBQWE7QUFDNUIsSUFBTSxhQUFhLE9BQU87QUFFMUIsT0FBTyxPQUFPLENBQUMsS0FBSyxZQUFZO0FBRTlCLE1BQUksSUFBSSxTQUFTLGlCQUFpQixFQUFHO0FBQ3JDLGFBQVcsS0FBSyxPQUFPO0FBQ3pCO0FBRUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsY0FBYztBQUFBLEVBQ2QsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBO0FBQUEsTUFFSCxPQUFPO0FBQUEsUUFDTCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLFFBQ3hDLFNBQVMsUUFBUSxrQ0FBVyxnQkFBZ0I7QUFBQSxNQUM5QztBQUFBLE1BQ0EsU0FBUyxDQUFDLElBQUk7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUloQjtBQUFBLElBQ0EsZUFBZTtBQUFBO0FBQUE7QUFBQSxNQUdiLFVBQVUsQ0FBQyxTQUFTO0FBQUEsTUFDcEIsUUFBUTtBQUFBO0FBQUE7QUFBQSxRQUdOLFNBQVM7QUFBQTtBQUFBLFFBRVQ7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLGVBQWU7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQUs7QUFBQSxVQUNMLE1BQU07QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
