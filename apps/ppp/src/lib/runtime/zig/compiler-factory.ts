import { untar } from '@andrewbranch/untar.js';
import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { createCompilerWASI, createProgramWASI, ZigCompiler, ZigProgram } from 'zig-runtime';

import zigWasmUrl from 'zig-runtime/zig.wasm?url';
import compilerRtUrl from 'zig-runtime/lib/libcompiler_rt.a?url';
import stdLibUrl from 'zig-runtime/lib/zig.tar.gz?url';

import { createCachedFetch } from '$lib/fetch';

export const makeZigCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = await createCachedFetch(
		'zig-cache@',
		`${zigWasmUrl}|${compilerRtUrl}|${stdLibUrl}`
	);
	async function fetch<R>(url: string, action: (r: Response) => R): Promise<R> {
		const response = await fetcher(url, { signal: ctx.signal });
		const result = await action(response);
		logger.info(`Loaded ${url}`);
		return result;
	}
	const [zigWasmModule, compilerRtArrayBuffer, stdLibFiles] = await Promise.all([
		fetch(zigWasmUrl, (r) => WebAssembly.compileStreaming(r)),
		fetch(compilerRtUrl, (r) => r.arrayBuffer()),
		fetch(stdLibUrl, async (r) => {
			let arrayBuffer = await r.arrayBuffer();
			const magicNumber = new Uint8Array(arrayBuffer).slice(0, 2);
			if (magicNumber[0] == 0x1f && magicNumber[1] == 0x8b) {
				const ds = new DecompressionStream('gzip');
				const response = new Response(new Response(arrayBuffer).body!.pipeThrough(ds));
				arrayBuffer = await response.arrayBuffer();
			} else {
				// already decompressed
			}
			return untar(arrayBuffer);
		})
	]);
	const compilerWasi = createCompilerWASI(streams, compilerRtArrayBuffer, stdLibFiles);
	const programWasi = createProgramWASI(streams);
	const compiler = new ZigCompiler(compilerWasi, zigWasmModule);
	return {
		async compile(ctx, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			const program = await compiler.compile(ctx, files[0].content);
			return new ZigProgram(
				programWasi,
				program.buffer instanceof ArrayBuffer
					? (program as Uint8Array<ArrayBuffer>)
					: new Uint8Array(program)
			);
		}
	};
};
