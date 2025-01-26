import type { Program } from "compiler";
import type { Context } from "libs/context";
import { isErr } from "libs/result";

import type { Executor } from "./model";

export class GoProgram implements Program {
  constructor(protected readonly program: Executor) {}

  async run(ctx: Context): Promise<void> {
    const result = await this.program(ctx.signal);
    if (isErr(result)) {
      throw new Error(result.error);
    }
  }
}
