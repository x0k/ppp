import type { Program } from "compiler";
import { type Context } from "libs/context";
import { patch } from "libs/patcher";

export class JsProgram implements Program {
  constructor(
    protected readonly code: string,
    protected readonly patchedConsole: Console
  ) {}

  async run(_: Context): Promise<void> {
    const consolePatch = patch(globalThis, "console", this.patchedConsole);
    try {
      eval(this.code);
    } finally {
      consolePatch[Symbol.dispose]();
    }
  }

  [Symbol.dispose](): void {}
}
