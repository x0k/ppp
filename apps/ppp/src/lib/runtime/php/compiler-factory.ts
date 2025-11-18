import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { phpCompilerFactory, PHPProgram } from 'php-runtime';

import phpWasmUrl from 'php-runtime/php.wasm?url';

export const makePhpCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const php = await phpCompilerFactory(ctx, async (info, resolve) => {
		const { instance, module } = await WebAssembly.instantiateStreaming(
			fetch(phpWasmUrl, { signal: ctx.signal, cache: 'force-cache' }),
			info
		);
		resolve(instance, module);
	});
	return {
		async compile(_, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			return new PHPProgram(files[0].content, php, streams);
		}
	};
};
