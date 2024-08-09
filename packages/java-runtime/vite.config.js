import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import inject from "@rollup/plugin-inject";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        version: resolve(__dirname, "src/version.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [/^libs\//],
    },
    commonjsOptions: {
      include: /node_modules/,
      transformMixedEsModules: true,
    }
  },
	define: {
		global: {},
    setImmediate: "queueMicrotask",
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
      BrowserFS: ["browserfs", "*"],
			process: "/src/bfs-process.js",
		}),
    dts(),
    viteStaticCopy({
      targets: [
        {
          src: "src/vendor/doppio.zip",
          dest: "doppio",
        },
      ],
    }),
  ],
});
