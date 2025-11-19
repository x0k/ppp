import type { Streams } from 'libs/io';
import { inContext, type Context } from 'libs/context';
import type { TestCompiler } from 'libs/testing';
import { createLogger, type Logger } from 'libs/logger';
import { createCachedFetch } from 'libs/fetch';
import { RubyTestProgram, createRubyVM } from 'ruby-runtime';

import rubyWasmUrl from 'ruby-runtime/ruby.wasm?url';

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class RubyTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		generateCaseExecutionCode: GenerateCaseExecutionCode<I>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends RubyTestProgram<I, O> {
			protected override caseExecutionCode(input: I): string {
				return generateCaseExecutionCode(input);
			}
		}
		const fetcher = createCachedFetch(await caches.open('ruby-cache'));
		const rubyWasmModule = await WebAssembly.compileStreaming(
			fetcher(rubyWasmUrl, { signal: ctx.signal })
		);
		this.logger.info(`Loaded ${rubyWasmUrl}`);
		return {
			compile: async (ctx, files) => {
				if (files.length !== 1) {
					throw new Error('Compilation of multiple files is not implemented');
				}
				const vm = await createRubyVM(ctx, this.streams, rubyWasmModule);
				await inContext(ctx, vm.evalAsync(files[0].content));
				return new TestProgram(vm);
			}
		};
	}
}
