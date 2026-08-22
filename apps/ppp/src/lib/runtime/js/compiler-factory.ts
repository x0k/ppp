import { redirect, createLogger } from 'libs/logger';
import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { JsProgram } from 'javascript-runtime';

export const makeJsCompiler: CompilerFactory<Streams, Program> = async (_, streams) => {
	const patchedConsole = redirect(globalThis.console, createLogger(streams.out));
	return {
		async compile(_, files) {
			return new JsProgram(files, patchedConsole);
		}
	};
};
