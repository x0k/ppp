import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { RubyProgram, createRubyVM } from 'ruby-runtime';

import rubyWasmUrl from 'ruby-runtime/ruby.wasm?url';

import { createCachedFetch } from '$lib/fetch';

export const makeRubyCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = await createCachedFetch('ruby-cache@', rubyWasmUrl);
	const rubyWasmModule = await WebAssembly.compileStreaming(
		fetcher(rubyWasmUrl, { signal: ctx.signal })
	);
	logger.info(`Loaded ${rubyWasmUrl}`);
	return {
		async compile(ctx, files) {
			const vm = await createRubyVM(ctx, streams, rubyWasmModule, files);
			return new RubyProgram(files, vm);
		}
	};
};
