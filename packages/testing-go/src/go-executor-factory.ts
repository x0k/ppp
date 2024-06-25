import type { Context } from "libs/context";
import { isErr } from "libs/result";

import { type Compiler, type Executor } from "./model";

export async function goExecutorFactory<O>(
  ctx: Context,
  compiler: Compiler,
  code: string
): Promise<Executor<O>> {
  const executor = await compiler.compile<O>(ctx.signal, code);
  if (isErr(executor)) {
    throw new Error(executor.error);
  }
  return executor.value;
}
