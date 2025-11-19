import type { CompilerFactory, Program } from 'libs/compiler';
import { createCachedFetch } from 'libs/fetch';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { phpCompilerFactory, PHPProgram } from 'php-runtime';

import phpWasmUrl from 'php-runtime/php.wasm?url';

export const makePhpCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = createCachedFetch(await caches.open('php-cache'));
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
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			return new PHPProgram(files[0].content, php, streams);
		}
	};
};
