import { isErr } from 'libs/result';

import { type Executor, type GoCompilerFactory, type GoProgramFactory } from './model';

export function makeGoExecutorFactory(makeCompiler: GoCompilerFactory): GoProgramFactory<Executor> {
	return async (ctx, streams, files) => {
		const compiler = makeCompiler(streams);
		const executor = await compiler.createExecutor(ctx.signal, files);
		if (isErr(executor)) {
			throw new Error(executor.error);
		}
		return executor.value;
	};
}
