import { resolve } from 'path';
import { defineConfig, createLogger } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const logger = createLogger();
const loggerWarn = logger.warn;

logger.warn = (msg, options) => {
	// Ignore warnings from the wasmoon distribution (node builtin stubs,
	// glue.wasm asset resolution).
	if (typeof msg === 'string' && msg.includes('wasmoon')) return;
	loggerWarn(msg, options);
};

export default defineConfig({
	customLogger: logger,
	build: {
		lib: {
			entry: {
				index: resolve(import.meta.dirname, 'src/index.ts'),
				version: resolve(import.meta.dirname, 'src/version.ts')
			},
			formats: ['es']
		},
		rollupOptions: {
			external: [/^libs\//]
		}
	},
	plugins: [
		dts(),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/wasmoon/dist/glue.wasm',
					dest: 'lua',
					rename: { stripBase: true }
				}
			]
		})
	]
});
