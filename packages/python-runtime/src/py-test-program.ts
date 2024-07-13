import { loadPyodide } from "pyodide";
import type { PyProxy } from "pyodide/ffi";

import { inContext, type Context } from "libs/context";
import type { TestProgram } from "testing";

function isPyProxy(obj: any): obj is PyProxy {
  return typeof obj === "object" && obj;
}

export abstract class PyTestProgram<I, O> implements TestProgram<I, O> {
  private proxies: PyProxy[] = [];

  constructor(
    protected readonly python: Awaited<ReturnType<typeof loadPyodide>>,
    protected readonly code: string
  ) {}

  protected caseExecutionCode(input: I): string {
    throw new Error("Not implemented");
  }

  protected transformCode(input: I): string {
    return `${this.code}\n${this.caseExecutionCode(input)}`;
  }

  protected transformResult(result: any): O {
    if (isPyProxy(result)) {
      this.proxies.push(result);
      return result.toJs({ pyproxies: this.proxies });
    }
    return result;
  }

  async run(ctx: Context, input: I): Promise<O> {
    return this.transformResult(
      await inContext(
        ctx,
        this.python.runPythonAsync(this.transformCode(input))
      )
    );
  }

  [Symbol.dispose](): void {
    for (const p of this.proxies) {
      p.destroy();
    }
    this.proxies.length = 0;
  }
}
