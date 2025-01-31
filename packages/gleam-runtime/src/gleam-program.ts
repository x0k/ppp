import type { Context } from "libs/context";
import { patch } from 'libs/patcher';
import type { Program } from "libs/compiler";

export interface GleamModule {
  main(): void | Promise<void>;
}

export class GleamProgram implements Program {
  constructor(
    protected readonly module: GleamModule,
    protected readonly patchedConsole: Console
  ) {}

  async run(_ctx: Context): Promise<void> {
    using _ = patch(globalThis, "console", this.patchedConsole);
      // By default gleam main function is synchronous
      // TODO: Find out if gleam can produce asynchronous code
    await this.module.main();
  }
}
