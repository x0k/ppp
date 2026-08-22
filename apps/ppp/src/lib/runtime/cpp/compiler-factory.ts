import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { createProgramWASI, CppCompiler, CppProgram } from 'cpp-runtime';

import clangWasmUrl from 'cpp-runtime/clang.wasm?url';
import lldWasmUrl from 'cpp-runtime/lld.wasm?url';
import sysrootUrl from 'cpp-runtime/sysroot.tar?url';

import { createCachedFetch } from '#lib/fetch.ts';

export const makeCppCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = await createCachedFetch(
		'cpp-cache@',
		`${clangWasmUrl}|${lldWasmUrl}|${sysrootUrl}`
	);
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
	return {
		async compile(ctx, files) {
			const program = await compiler.compile(ctx, files);
			return new CppProgram(createProgramWASI(streams), program as Uint8Array<ArrayBuffer>);
		}
	};
};
