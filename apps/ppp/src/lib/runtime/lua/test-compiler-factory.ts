import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';
import { createLogger, type Logger } from 'libs/logger';
import type { TestCompiler } from 'libs/testing';
import { luaRuntimeFactory, LuaTestProgram } from 'lua-runtime';

import glueWasmUrl from 'lua-runtime/glue.wasm?url';

import { createCachedFetch } from '#lib/fetch.ts';

export type CaseExecutionCode<I> = (input: I) => string;
export type TransformResult<O> = (result: unknown) => O;

export class LuaTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		caseExecutionCode: CaseExecutionCode<I>,
		transformResult: TransformResult<O>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends LuaTestProgram<I, O> {
			protected override caseExecutionCode(input: I): string {
				return caseExecutionCode(input);
			}
			protected override transformResult(result: unknown): O {
				return transformResult(result);
			}
		}
		const fetcher = await createCachedFetch('lua-cache@', glueWasmUrl);
		const response = await fetcher(glueWasmUrl, { signal: ctx.signal });
		this.logger.info(`Loaded ${glueWasmUrl}`);
		const wasmUri = URL.createObjectURL(await response.blob());
		const streams = this.streams;
		const runtime = await luaRuntimeFactory(ctx, streams, wasmUri);
		return {
			async compile(_, files) {
				return new TestProgram(runtime.factory, runtime.engine, files);
			}
		};
	}
}
