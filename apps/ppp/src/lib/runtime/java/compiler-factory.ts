import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { initFs, JavaCompiler, JavaProgram, makeJVMFactory } from 'java-runtime';

import libZipUrl from 'java-runtime/doppio.zip?url';

import { createCachedFetch } from '$lib/fetch';

const CLASSNAME = 'Program';

export const makeJavaCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const jvmFactory = makeJVMFactory(streams);
	const logger = createLogger(streams.out);
	const fetcher = await createCachedFetch('java-cache@', libZipUrl);
	const libZipData = await fetcher(libZipUrl, {
		signal: ctx.signal
	}).then((response) => response.arrayBuffer());
	logger.info(`Loaded ${libZipUrl}`);
	const fs = await initFs(libZipData);
	const compiler = new JavaCompiler(jvmFactory, fs);
	return {
		async compile(ctx, files) {
			await compiler.compile(ctx, files);
			return new JavaProgram(CLASSNAME, jvmFactory);
		}
	};
};
