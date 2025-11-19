import type { Context } from 'libs/context';
import { createCachedFetch } from 'libs/fetch';
import type { Streams } from 'libs/io';
import { createLogger, type Logger } from 'libs/logger';
import type { TestCompiler } from 'libs/testing';
import { pyRuntimeFactory, PyTestProgram } from 'python-runtime';

import wasmUrl from 'python-runtime/pyodide.wasm?url';
import stdlibUrl from 'python-runtime/python-stdlib.zip?url';

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class PythonTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		generateCaseExecutionCode: GenerateCaseExecutionCode<I>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends PyTestProgram<I, O> {
			protected override caseExecutionCode(data: I): string {
				return generateCaseExecutionCode(data);
			}
		}
		const fetcher = createCachedFetch(await caches.open('python-cache'));
		const pyRuntime = await pyRuntimeFactory(
			ctx,
			this.streams,
			(ctx, imports) =>
				WebAssembly.instantiateStreaming(fetcher(wasmUrl, { signal: ctx.signal }), imports),
			stdlibUrl
		);
		this.logger.info(`Loaded ${wasmUrl}`);
		return {
			async compile(_, files) {
				if (files.length !== 1) {
					throw new Error('Compilation of multiple files is not implemented');
				}
				return new TestProgram(pyRuntime, files[0].content);
			}
		};
	}
}
