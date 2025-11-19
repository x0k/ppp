import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createCachedFetch } from 'libs/fetch';
import { createLogger } from 'libs/logger';
import {
	GoProgram,
	makeCompilerFactory,
	makeGoCompilerFactory,
	makeGoExecutorFactory
} from 'go-runtime';

import wasmUrl from 'go-runtime/compiler.wasm?url';

export const makeGoCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = createCachedFetch(await caches.open('go-cache'));
	const goExecutorFactory = makeGoExecutorFactory(
		makeGoCompilerFactory(
			await makeCompilerFactory((imports) =>
				WebAssembly.instantiateStreaming(fetcher(wasmUrl, { signal: ctx.signal }), imports).then(
					(m) => m.instance
				)
			)
		)
	);
	logger.info(`Loaded ${wasmUrl}`);
	return {
		async compile(ctx, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			return new GoProgram(await goExecutorFactory(ctx, streams, files[0].content));
		}
	};
};
