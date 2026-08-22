import type { Streams } from 'libs/io';
import { inContext, type Context } from 'libs/context';
import type { TestCompiler } from 'libs/testing';
import { createLogger, type Logger } from 'libs/logger';
import { RubyTestProgram, createRubyVM, rubyEntryFile, rubyFilePath } from 'ruby-runtime';

import rubyWasmUrl from 'ruby-runtime/ruby.wasm?url';

import { createCachedFetch } from '#lib/fetch.ts';

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
		const fetcher = await createCachedFetch('ruby-cache@', rubyWasmUrl);
		const rubyWasmModule = await WebAssembly.compileStreaming(
			fetcher(rubyWasmUrl, { signal: ctx.signal })
		);
		this.logger.info(`Loaded ${rubyWasmUrl}`);
		return {
			compile: async (ctx, files) => {
				const vm = await createRubyVM(ctx, this.streams, rubyWasmModule, files);
				const entry = rubyFilePath(rubyEntryFile(files));
				// Load the entry from the VM filesystem instead of evaluating it
				// inline, so require_relative works across the program files.
				await inContext(ctx, vm.evalAsync(`load '${entry}'`));
				return new TestProgram(vm);
			}
		};
	}
}
