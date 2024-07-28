import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import inject from "@rollup/plugin-inject";

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
  	// global process from browserfs
	define: {
		global: {},
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
  plugins: [
    inject({
			browserfs: "/src/bfs.js",
			process: "/src/bfs-process.js",
		}),
    dts(),
  ],
});
