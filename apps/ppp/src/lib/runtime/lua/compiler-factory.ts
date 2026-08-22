import type { CompilerFactory, Program } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { createLogger } from 'libs/logger';
import { luaRuntimeFactory, LuaProgram } from 'lua-runtime';

import glueWasmUrl from 'lua-runtime/glue.wasm?url';

import { createCachedFetch } from '#lib/fetch.ts';

export const makeLuaCompiler: CompilerFactory<Streams, Program> = async (ctx, streams) => {
	const logger = createLogger(streams.out);
	const fetcher = await createCachedFetch('lua-cache@', glueWasmUrl);
	const response = await fetcher(glueWasmUrl, { signal: ctx.signal });
	logger.info(`Loaded ${glueWasmUrl}`);
	const wasmUri = URL.createObjectURL(await response.blob());
	const runtime = await luaRuntimeFactory(ctx, streams, wasmUri);
	return {
		async compile(_, files) {
			return new LuaProgram(runtime.factory, runtime.engine, files);
		}
	};
};
