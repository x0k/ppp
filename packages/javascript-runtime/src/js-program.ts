import type { Program } from "compiler";
import { type Context } from "libs/context";
import { patch } from "libs/patcher";

export class JsProgram implements Program {
  constructor(
    protected readonly code: string,
    protected readonly patchedConsole: Console
  ) {}

  async run(_ctx: Context): Promise<void> {
    using _ = patch(globalThis, "console", this.patchedConsole);
    eval(this.code);
  }
}
