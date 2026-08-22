import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { phpCompilerFactory, PHPProgram } from 'php-runtime';

import phpWasmUrl from 'php-runtime/php.wasm?url';

import { createCachedFetch } from '$lib/fetch';

export const makePhpCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = await createCachedFetch('php-cache@', phpWasmUrl);
	const php = await phpCompilerFactory(ctx, async (info, resolve) => {
		const { instance, module } = await WebAssembly.instantiateStreaming(
			fetcher(phpWasmUrl, { signal: ctx.signal }),
			info
		);
		resolve(instance, module);
	});
	logger.info(`Loaded ${phpWasmUrl}`);
	return {
		async compile(_, files) {
			return new PHPProgram(files, php, streams);
		}
	};
};
