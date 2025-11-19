import type { CompilerFactory, Program } from 'libs/compiler';
import { createCachedFetch } from 'libs/fetch';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { PyProgram, pyRuntimeFactory } from 'python-runtime';

import wasmUrl from 'python-runtime/pyodide.wasm?url';
import stdlibUrl from 'python-runtime/python-stdlib.zip?url';

export const makePythonCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = createCachedFetch(await caches.open('python-cache'));
	const pyRuntime = await pyRuntimeFactory(
		ctx,
		streams,
		(ctx, imports) =>
			WebAssembly.instantiateStreaming(fetcher(wasmUrl, { signal: ctx.signal }), imports),
		stdlibUrl
	);
	logger.info(`Loaded ${wasmUrl}`);
	return {
		async compile(_, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			return new PyProgram(files[0].content, pyRuntime);
		}
	};
};
