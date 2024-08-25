import { isErr } from "libs/result";

import {
  type Executor,
  type GoCompilerFactory,
  type GoProgramFactory,
} from "./model";

export function makeGoExecutorFactory(
  makeCompiler: GoCompilerFactory
): GoProgramFactory<Executor> {
  return async (ctx, out, code) => {
    const compiler = makeCompiler(out);
    const executor = await compiler.createExecutor(ctx.signal, code);
    if (isErr(executor)) {
      throw new Error(executor.error);
    }
    return executor.value;
  };
}
