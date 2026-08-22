import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import Icons from 'unplugin-icons/vite';
import { DEV } from 'esm-env';
import adapter from '@sveltejs/adapter-static';
import { resolve } from 'path';

const base = DEV ? undefined : process.env.BASE_PATH?.slice(1);

export default defineConfig({
	worker: {
		format: 'es'
	},
	resolve: {
		alias: {
			// monaco 0.56 added a strict exports map that doesn't match
			// subpath imports with vite's ?worker query suffix
			'monaco-editor/esm/vs': resolve(import.meta.dirname, 'node_modules/monaco-editor/esm/vs')
		}
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
		sveltekit({
			adapter: adapter({
				fallback: '404.html',
				pages: 'dist'
			}),
			paths: {
				base: process.argv.includes('dev')
					? ''
					: (process.env.BASE_PATH as `/${string}` | undefined),
				relative: false
			}
		}),
		Icons({ compiler: 'svelte' }),
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'baseLocale'],
			urlPatterns: base
				? [
						{
							pattern: `/{${base}/}?:path(.*)?`,
							localized: [
								['ru', `/{${base}/}?ru/:path(.*)?`],
								['en', `/{${base}/}?:path(.*)?`]
							]
						}
					]
				: undefined
		}),
		viteStaticCopy({
			targets: [
				{
					src: 'node_modules/gleam-runtime/dist/precompiled',
					dest: 'assets/gleam',
					rename: { stripBase: 4 }
				},
				{
					src: 'node_modules/dotnet-runtime/dist/compiler',
					dest: 'assets/dotnet',
					rename: { stripBase: 4 }
				},
				{
					// pyodide 314 eagerly fetches `${indexURL}pyodide.asm.wasm` itself,
					// so the wasm must be available at a stable (non-hashed) path
					src: 'node_modules/python-runtime/dist/pyodide',
					dest: 'assets/pyodide',
					rename: { stripBase: 4 }
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
