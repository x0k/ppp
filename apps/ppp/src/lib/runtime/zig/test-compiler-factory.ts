import { untar } from '@andrewbranch/untar.js';
import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';
import { createLogger, type Logger } from 'libs/logger';
import type { TestCompiler } from 'libs/testing';
import { ZigTestProgram, createCompilerWASI } from 'zig-runtime';

import zigWasmUrl from 'zig-runtime/zig.wasm?url';
import compilerRtUrl from 'zig-runtime/lib/libcompiler_rt.a?url';
import stdLibUrl from 'zig-runtime/lib/zig.tar.gz?url';

import { createCachedFetch } from '$lib/fetch';

export type GenerateOutputContentCode<I> = (input: I) => string;
export type TransformResult<O> = (result: string) => O;

export class ZigTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		generateOutputContentCode: GenerateOutputContentCode<I>,
		transformResult: TransformResult<O>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends ZigTestProgram<I, O> {
			protected override generateOutputContentCode(input: I): string {
				return generateOutputContentCode(input);
			}
			protected override transformResult(data: string): O {
				return transformResult(data);
			}
		}
		const fetcher = await createCachedFetch(
			'zig-cache@',
			`${zigWasmUrl}|${compilerRtUrl}|${stdLibUrl}`
		);
		const logger = this.logger;
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
		const wasi = createCompilerWASI(this.streams, compilerRtArrayBuffer, stdLibFiles, [
			'--export=_start'
		]);
		return {
			async compile(_, files) {
				return new TestProgram(files, wasi, zigWasmModule, 'case_output');
			}
		};
	}
}
