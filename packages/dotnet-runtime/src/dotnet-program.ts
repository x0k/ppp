import type { Program } from "compiler";
import type { Context } from "libs/context";

import type { DotnetRuntime } from "./dotnet-runtime-factory";

export class DotnetProgram implements Program {
  constructor(protected readonly runtime: DotnetRuntime) {}

  async run(_: Context): Promise<void> {
    const status = this.runtime.Run("Program", "Main", []);
    if (status !== 0) {
      throw new Error("Run failed");
    }
  }

  [Symbol.dispose](): void {
    this.runtime.DisposeAssembly();
  }
}
