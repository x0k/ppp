import type { Context } from "libs/context";
import { patch } from 'libs/patcher';
import type { Program } from "compiler";

export interface GleamModule {
  main(): void;
}

export class GleamProgram implements Program {
  constructor(protected readonly module: GleamModule,
    protected readonly patchedConsole: Console
  ) {}

  async run(_: Context): Promise<void> {
    const consolePatch = patch(globalThis, "console", this.patchedConsole);
    try {
      // By default gleam main function is synchronous
      // TODO: Find out if gleam can produce asynchronous code
      await this.module.main();
    } finally {
      consolePatch[Symbol.dispose]();
    }
  }

  [Symbol.dispose](): void {}
}
