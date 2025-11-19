import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';
import type { TestCompiler } from 'libs/testing';
import { createLogger, type Logger } from 'libs/logger';
import { createCachedFetch } from 'libs/fetch';
import {
	makeCompilerFactory,
	makeGoCompilerFactory,
	makeGoEvaluatorFactory,
	GoTestProgram
} from 'go-runtime';

import wasmUrl from 'go-runtime/compiler.wasm?url';

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class GoTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		generateCaseExecutionCode: GenerateCaseExecutionCode<I>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends GoTestProgram<I, O> {
			protected override generateCaseExecutionCode(input: I): string {
				return generateCaseExecutionCode(input);
			}
		}
		const fetcher = createCachedFetch(await caches.open('go-cache'));
		const goEvaluatorFactory = makeGoEvaluatorFactory<O>(
			makeGoCompilerFactory(
				await makeCompilerFactory((imports) =>
					WebAssembly.instantiateStreaming(fetcher(wasmUrl, { signal: ctx.signal }), imports).then(
						(m) => m.instance
					)
				)
			)
		);
	  this.logger.info(`Loaded ${wasmUrl}`);
		return {
			compile: async (ctx, files) => {
				if (files.length !== 1) {
					throw new Error('Compilation of multiple files is not implemented');
				}
				return new TestProgram(await goEvaluatorFactory(ctx, this.streams, files[0].content));
			}
		};
	}
}
