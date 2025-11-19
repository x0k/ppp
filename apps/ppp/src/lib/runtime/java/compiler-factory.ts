import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { createCachedFetch } from 'libs/fetch';
import { initFs, JavaCompiler, JavaProgram, makeJVMFactory } from 'java-runtime';

import libZipUrl from 'java-runtime/doppio.zip?url';

const CLASSNAME = 'Program';

export const makeJavaCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const jvmFactory = makeJVMFactory(streams);
	const logger = createLogger(streams.out);
	const fetcher = createCachedFetch(await caches.open('java-cache'));
	const libZipData = await fetcher(libZipUrl, {
		signal: ctx.signal
	}).then((response) => response.arrayBuffer());
	logger.info(`Loaded ${libZipUrl}`);
	const fs = await initFs(libZipData);
	const compiler = new JavaCompiler(jvmFactory, `/home/${CLASSNAME}.java`, fs);
	return {
		async compile(ctx, files) {
			if (files.length !== 1) {
				throw new Error('Compilation of multiple files is not implemented');
			}
			await compiler.compile(ctx, files[0].content);
			return new JavaProgram(CLASSNAME, jvmFactory);
		}
	};
};
