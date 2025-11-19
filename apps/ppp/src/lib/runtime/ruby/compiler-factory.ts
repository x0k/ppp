import type { CompilerFactory, Program } from 'libs/compiler';
import { createCachedFetch } from 'libs/fetch';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { RubyProgram, createRubyVM } from 'ruby-runtime';

import rubyWasmUrl from 'ruby-runtime/ruby.wasm?url';

export const makeRubyCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = createCachedFetch(await caches.open('ruby-cache'));
	const rubyWasmModule = await WebAssembly.compileStreaming(
		fetcher(rubyWasmUrl, { signal: ctx.signal })
	);
	logger.info(`Loaded ${rubyWasmUrl}`);
	return {
		async compile(_, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			const vm = await createRubyVM(ctx, streams, rubyWasmModule);
			return new RubyProgram(files[0].content, vm);
		}
	};
};
