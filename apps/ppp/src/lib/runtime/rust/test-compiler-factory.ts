import type { Context } from 'libs/context';
import { createCachedFetch } from 'libs/fetch';
import type { Streams } from 'libs/io';
import { createLogger, type Logger } from 'libs/logger';
import type { TestCompiler } from 'libs/testing';
import { RustTestProgram, createWASI } from 'rust-runtime';

import miriWasmUrl from 'rust-runtime/miri.wasm?url';

const libsUrls = import.meta.glob('/node_modules/rust-runtime/dist/lib/*', {
	eager: true,
	import: 'default',
	query: '?url'
}) as Record<string, string>;

export type GenerateOutputContentCode<I> = (input: I) => string;
export type TransformResult<O> = (result: string) => O;

export class RustTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		generateOutputContentCode: GenerateOutputContentCode<I>,
		transformResult: TransformResult<O>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends RustTestProgram<I, O> {
			protected override generateOutputContentCode(input: I): string {
				return generateOutputContentCode(input);
			}
			protected override transformResult(data: string): O {
				return transformResult(data);
			}
		}
		const fetcher = createCachedFetch(await caches.open('rust-cache'));
		const [miri, libs] = await Promise.all([
			await WebAssembly.compileStreaming(
				fetcher(miriWasmUrl, { signal: ctx.signal }).then((r) => {
					this.logger.info(`Loaded ${miriWasmUrl}`);
					return r;
				})
			),
			Promise.all(
				Object.entries(libsUrls).map(async ([lib, url]) => {
					const response = await fetcher(url, {
						signal: ctx.signal
					});
					const buffer = await response.arrayBuffer();
					this.logger.info(`Loaded ${url}`);
					return [lib.slice(36), buffer] as [string, ArrayBuffer];
				})
			)
		]);
		const wasi = createWASI(this.streams, libs);
		return {
			async compile(_, files) {
				if (files.length !== 1) {
					throw new Error('Compilation of multiple files is not implemented');
				}
				return new TestProgram(files[0].content, wasi, miri, 'case_output');
			}
		};
	}
}
