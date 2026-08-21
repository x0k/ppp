import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { PyProgram, pyRuntimeFactory } from 'python-runtime';

export const makePythonCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const indexUrl = new URL(
		`${import.meta.env.BASE_URL.replace(/\/$/, '')}/assets/pyodide/`,
		globalThis.location.origin
	).toString();
	const pyRuntime = await pyRuntimeFactory(ctx, streams, indexUrl);
	logger.info(`Loaded ${indexUrl}`);
	return {
		async compile(_, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			return new PyProgram(files[0].content, pyRuntime);
		}
	};
};
