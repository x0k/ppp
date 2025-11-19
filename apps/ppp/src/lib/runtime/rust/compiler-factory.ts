import type { CompilerFactory, Program } from 'libs/compiler';
import { createCachedFetch } from 'libs/fetch';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { RustProgram, createWASI } from 'rust-runtime';

import miriWasmUrl from 'rust-runtime/miri.wasm?url';

const libsUrls = import.meta.glob('/node_modules/rust-runtime/dist/lib/*', {
	eager: true,
	import: 'default',
	query: '?url'
}) as Record<string, string>;

export const makeRustCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = createCachedFetch(await caches.open('rust-cache'));
	const [miri, libs] = await Promise.all([
		await WebAssembly.compileStreaming(
			fetcher(miriWasmUrl, { signal: ctx.signal }).then((r) => {
				logger.info(`Loaded ${miriWasmUrl}`);
				return r;
			})
		),
		Promise.all(
			Object.entries(libsUrls).map(async ([lib, url]) => {
				const response = await fetcher(url, {
					signal: ctx.signal
				});
				const buffer = await response.arrayBuffer();
				logger.info(`Loaded ${url}`);
				return [lib.slice(36), buffer] as [string, ArrayBuffer];
			})
		)
	]);
	const wasi = createWASI(streams, libs);
	return {
		async compile(_, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			return new RustProgram(files[0].content, wasi, miri);
		}
	};
};
