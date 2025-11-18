import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { inContext } from 'libs/context';
import {
	GoProgram,
	makeCompilerFactory,
	makeGoCompilerFactory,
	makeGoExecutorFactory
} from 'go-runtime';

import wasmInit from 'go-runtime/compiler.wasm?init';

export const makeGoCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const goExecutorFactory = makeGoExecutorFactory(
		makeGoCompilerFactory(await makeCompilerFactory((imports) => inContext(ctx, wasmInit(imports))))
	);
	return {
		async compile(ctx, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			return new GoProgram(await goExecutorFactory(ctx, streams, files[0].content));
		}
	};
};
