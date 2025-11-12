import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: '404.html'
			// assets: 'build/assets'
		}),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		},
		typescript: {
			config: (config) => {
				config.exclude.push(
					'../src/lib/assets/**',
					'../src/routes/(app)/problems/**/runtimes/*/code.*'
				);
				return config;
			}
		}
	}
};

export default config;
