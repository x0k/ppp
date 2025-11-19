import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';
import type { TestCompiler } from 'libs/testing';
import { createLogger, type Logger } from 'libs/logger';
import { createCachedFetch } from 'libs/fetch';
import { phpCompilerFactory, PHPTestProgram } from 'php-runtime';

import phpWasmUrl from 'php-runtime/php.wasm?url';

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class PhpTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		generateCaseExecutionCode: GenerateCaseExecutionCode<I>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends PHPTestProgram<I, O> {
			protected override caseExecutionCode(data: I): string {
				return generateCaseExecutionCode(data);
			}
		}
		const fetcher = createCachedFetch(await caches.open('php-cache'));
		const php = await phpCompilerFactory(ctx, async (info, resolve) => {
			const { instance, module } = await WebAssembly.instantiateStreaming(
				fetcher(phpWasmUrl, { signal: ctx.signal }),
				info
			);
			resolve(instance, module);
		});
		this.logger.info(`Loaded ${phpWasmUrl}`);
		return {
			compile: async (ctx, files) => {
				if (files.length !== 1) {
					throw new Error('Compilation of multiple files is not implemented');
				}
				const program = new TestProgram(this.streams, php, files[0].content);
				ctx.onCancel(() => {
					program[Symbol.dispose]();
				});
				return program;
			}
		};
	}
}
