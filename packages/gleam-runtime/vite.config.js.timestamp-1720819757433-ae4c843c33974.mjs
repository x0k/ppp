// vite.config.js
import { resolve } from "path";
import { defineConfig } from "file:///home/roman/Projects/ppp/node_modules/.pnpm/vite@5.3.3_@types+node@20.14.2/node_modules/vite/dist/node/index.js";
import dts from "file:///home/roman/Projects/ppp/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.14.2_rollup@4.18.0_typescript@5.5.3_vite@5.3.3_@types+node@20.14.2_/node_modules/vite-plugin-dts/dist/index.mjs";
import { viteStaticCopy } from "file:///home/roman/Projects/ppp/node_modules/.pnpm/vite-plugin-static-copy@1.0.6_vite@5.3.3_@types+node@20.14.2_/node_modules/vite-plugin-static-copy/dist/index.js";
var __vite_injected_original_dirname = "/home/roman/Projects/ppp/packages/gleam-runtime";
var vite_config_default = defineConfig({
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
          src: "src/vendor/compiler/gleam_wasm_bg.wasm",
          dest: "."
        },
        {
          src: "src/vendor/stdlib/precompiled",
          dest: "."
        }
      ]
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9yb21hbi9Qcm9qZWN0cy9wcHAvcGFja2FnZXMvZ2xlYW0tcnVudGltZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcm9tYW4vUHJvamVjdHMvcHBwL3BhY2thZ2VzL2dsZWFtLXJ1bnRpbWUvdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcm9tYW4vUHJvamVjdHMvcHBwL3BhY2thZ2VzL2dsZWFtLXJ1bnRpbWUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgZHRzIGZyb20gXCJ2aXRlLXBsdWdpbi1kdHNcIjtcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSBcInZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICAvLyBDb3VsZCBhbHNvIGJlIGEgZGljdGlvbmFyeSBvciBhcnJheSBvZiBtdWx0aXBsZSBlbnRyeSBwb2ludHNcbiAgICAgIGVudHJ5OiB7XG4gICAgICAgIGluZGV4OiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICAgIHZlcnNpb246IHJlc29sdmUoX19kaXJuYW1lLCBcInNyYy92ZXJzaW9uLnRzXCIpLFxuICAgICAgfSxcbiAgICAgIGZvcm1hdHM6IFtcImVzXCJdLFxuICAgICAgLy8gbmFtZTogXCJNeUxpYlwiLFxuICAgICAgLy8gdGhlIHByb3BlciBleHRlbnNpb25zIHdpbGwgYmUgYWRkZWRcbiAgICAgIC8vIGZpbGVOYW1lOiBcImluZGV4XCIsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAvLyBtYWtlIHN1cmUgdG8gZXh0ZXJuYWxpemUgZGVwcyB0aGF0IHNob3VsZG4ndCBiZSBidW5kbGVkXG4gICAgICAvLyBpbnRvIHlvdXIgbGlicmFyeVxuICAgICAgZXh0ZXJuYWw6IFsvXmxpYnNcXC8vXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBQcm92aWRlIGdsb2JhbCB2YXJpYWJsZXMgdG8gdXNlIGluIHRoZSBVTUQgYnVpbGRcbiAgICAgICAgLy8gZm9yIGV4dGVybmFsaXplZCBkZXBzXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAvLyB2dWU6IFwiVnVlXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBkdHMoKSxcbiAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICB0YXJnZXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6IFwic3JjL3ZlbmRvci9jb21waWxlci9nbGVhbV93YXNtX2JnLndhc21cIixcbiAgICAgICAgICBkZXN0OiBcIi5cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHNyYzogXCJzcmMvdmVuZG9yL3N0ZGxpYi9wcmVjb21waWxlZFwiLFxuICAgICAgICAgIGRlc3Q6IFwiLlwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KSxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErVCxTQUFTLGVBQWU7QUFDdlYsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsc0JBQXNCO0FBSC9CLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQTtBQUFBLE1BRUgsT0FBTztBQUFBLFFBQ0wsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxRQUN4QyxTQUFTLFFBQVEsa0NBQVcsZ0JBQWdCO0FBQUEsTUFDOUM7QUFBQSxNQUNBLFNBQVMsQ0FBQyxJQUFJO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJaEI7QUFBQSxJQUNBLGVBQWU7QUFBQTtBQUFBO0FBQUEsTUFHYixVQUFVLENBQUMsU0FBUztBQUFBLE1BQ3BCLFFBQVE7QUFBQTtBQUFBO0FBQUEsUUFHTixTQUFTO0FBQUE7QUFBQSxRQUVUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixlQUFlO0FBQUEsTUFDYixTQUFTO0FBQUEsUUFDUDtBQUFBLFVBQ0UsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
