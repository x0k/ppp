import { isErr } from "libs/result";

import { type Evaluator, type GoCompilerFactory, type GoProgramFactory } from "./model";

export function makeGoEvaluatorFactory<O>(
  makeCompiler: GoCompilerFactory
): GoProgramFactory<Evaluator<O>> {
  return async (ctx, streams, code) => {
    const compiler = makeCompiler(streams);
    const executor = await compiler.createEvaluator<O>(ctx.signal, code);
    if (isErr(executor)) {
      throw new Error(executor.error);
    }
    return executor.value;
  };
}
