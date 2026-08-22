import { redirect, createLogger } from 'libs/logger';
import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { JsProgram } from 'javascript-runtime';
import { compileTsModule } from 'typescript-runtime';

export const makeTsCompiler: CompilerFactory<Streams, Program> = async (_, streams) => {
	const patchedConsole = redirect(globalThis.console, createLogger(streams.out));
	return {
		async compile(_, files) {
			const modules = files.map((file) => ({
				filename: file.filename,
				content: compileTsModule(file.content)
			}));
			return new JsProgram(modules, patchedConsole);
		}
	};
};
