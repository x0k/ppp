import { redirect, createLogger } from 'libs/logger';
import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { compileJsModule } from 'libs/js';
import { GleamModuleCompiler, type GleamModule, GleamProgram } from 'gleam-runtime';

import compilerWasmUrl from 'gleam-runtime/compiler.wasm?url';

import { createCachedFetch } from '#lib/fetch.ts';

const precompiledGleamStdlibIndexUrl = new URL(
	`${import.meta.env.BASE_URL.replace(/\/$/, '')}/assets/gleam`,
	globalThis.location.origin
).toString();

export const makeGleamCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const patchedConsole = redirect(globalThis.console, logger);
	const fetcher = await createCachedFetch('gleam-cache@', compilerWasmUrl);
	const compiler = new GleamModuleCompiler(
		streams.out,
		precompiledGleamStdlibIndexUrl,
		await WebAssembly.compileStreaming(fetcher(compilerWasmUrl, { signal: ctx.signal }))
	);
	logger.info(`Loaded ${compilerWasmUrl}`);
	return {
		async compile(_, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			const jsCode = compiler.compile(files[0].content);
			const jsModule = await compileJsModule(jsCode);
			if (!jsModule || typeof jsModule !== 'object') {
				throw new Error('Compilation failed');
			}
			if (!('main' in jsModule) || typeof jsModule.main !== 'function') {
				throw new Error('Main function is missing');
			}
			return new GleamProgram(jsModule as GleamModule, patchedConsole);
		}
	};
};
