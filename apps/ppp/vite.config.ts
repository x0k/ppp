import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import Icons from 'unplugin-icons/vite'

export default defineConfig({
	worker: {
		format: 'es'
	},
	esbuild: {
		target: 'es2022'
	},
	// https://github.com/chaosprint/vite-plugin-cross-origin-isolation/issues/3#issuecomment-1126879870
	server: {
		headers: {
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin'
		}
	},
	build: {
		rollupOptions: {
			external: ['sharp']
		}
	},
	assetsInclude: ['**/*.wasm', '**/*.zip', '**/*.rlib', '**/*.so'],
	plugins: [
		tailwindcss(),
		sveltekit(),
		Icons({ compiler: 'svelte' }),
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'baseLocale']
		}),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/gleam-runtime/dist/precompiled',
					dest: 'assets',
					rename: 'gleam'
				},
				{
					src: 'node_modules/dotnet-runtime/dist/compiler',
					dest: 'assets/dotnet'
				},
				{
					src: 'node_modules/dotnet-runtime/dist/lib',
					dest: 'assets/dotnet'
				}
			]
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
