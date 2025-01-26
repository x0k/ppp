import type { loadPyodide } from "pyodide";
import type { Program } from "compiler";
import { inContext, type Context } from "libs/context";

export class PyProgram implements Program {
  constructor(
    protected readonly code: string,
    protected readonly python: Awaited<ReturnType<typeof loadPyodide>>
  ) {}

  async run(ctx: Context): Promise<void> {
    await inContext(ctx, this.python.runPythonAsync(this.code));
  }
}
