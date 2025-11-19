import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';
import { createLogger, redirect, type Logger } from 'libs/logger';
import { compileJsModule } from 'libs/js';
import type { TestCompiler } from 'libs/testing';
import { createCachedFetch } from 'libs/fetch';
import { JsTestProgram } from 'javascript-runtime';
import { GleamModuleCompiler } from 'gleam-runtime';

import { base } from '$app/paths';

import compilerWasmUrl from 'gleam-runtime/compiler.wasm?url';

const precompiledGleamStdlibIndexUrl = new URL(
	`${base}/assets/gleam`,
	globalThis.location.origin
).toString();

export type ExecuteTest<M, I, O> = (m: M, input: I) => Promise<O>;

export class GleamTestCompilerFactory {
	protected readonly logger: Logger;
	protected readonly patchedConsole: Console;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
		this.patchedConsole = redirect(globalThis.console, this.logger);
	}

	async create<M, I, O>(
		ctx: Context,
		executeTest: ExecuteTest<M, I, O>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends JsTestProgram<M, I, O> {
			override async executeTest(m: M, input: I): Promise<O> {
				return executeTest(m, input);
			}
		}
		const fetcher = createCachedFetch(await caches.open('gleam-cache'));
		const compiler = new GleamModuleCompiler(
			this.streams.out,
			precompiledGleamStdlibIndexUrl,
			await WebAssembly.compileStreaming(fetcher(compilerWasmUrl, { signal: ctx.signal }))
		);
		this.logger.info(`Loaded ${compilerWasmUrl}`);
		return {
			compile: async (_, files) => {
				if (files.length !== 1) {
					throw new Error('Compilation of multiple files is not implemented');
				}
				const jsCode = compiler.compile(files[0].content);
				return new TestProgram(await compileJsModule(jsCode), this.patchedConsole);
			}
		};
	}
}
