import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';
import { createLogger, type Logger } from 'libs/logger';
import type { TestCompiler } from 'libs/testing';
import { CppCompiler, CppTestProgram } from 'cpp-runtime';

import clangWasmUrl from 'cpp-runtime/clang.wasm?url';
import lldWasmUrl from 'cpp-runtime/lld.wasm?url';
import sysrootUrl from 'cpp-runtime/sysroot.tar?url';

import { createCachedFetch } from '$lib/fetch';

export type GenerateOutputContentCode<I> = (input: I) => string;
export type TransformResult<O> = (result: string) => O;

export class CppTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		generateOutputContentCode: GenerateOutputContentCode<I>,
		transformResult: TransformResult<O>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends CppTestProgram<I, O> {
			protected override generateOutputContentCode(input: I): string {
				return generateOutputContentCode(input);
			}
			protected override transformResult(data: string): O {
				return transformResult(data);
			}
		}
		const fetcher = await createCachedFetch(
			'cpp-cache@',
			`${clangWasmUrl}|${lldWasmUrl}|${sysrootUrl}`
		);
		const logger = this.logger;
		async function fetch<R>(url: string, action: (r: Response) => R): Promise<R> {
			const response = await fetcher(url, { signal: ctx.signal });
			const result = await action(response);
			logger.info(`Loaded ${url}`);
			return result;
		}
		const [clangBinary, lldBinary, sysroot] = await Promise.all([
			fetch(clangWasmUrl, (r) => r.arrayBuffer()),
			fetch(lldWasmUrl, (r) => r.arrayBuffer()),
			fetch(sysrootUrl, (r) => r.arrayBuffer())
		]);
		const compiler = new CppCompiler(clangBinary, lldBinary, sysroot);
		const streams = this.streams;
		return {
			async compile(_, files) {
				return new TestProgram(files, compiler, streams);
			}
		};
	}
}
