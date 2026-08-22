import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: resolve(import.meta.dirname, 'src/index.ts'),
				version: resolve(import.meta.dirname, 'src/version.ts')
			},
			formats: ['es']
		},
		rollupOptions: {
			external: [/^libs\//, '@bjorn3/browser_wasi_shim']
		}
	},
	plugins: [dts()]
});
