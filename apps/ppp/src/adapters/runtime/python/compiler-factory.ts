import type { Compiler } from "compiler";
import type { Context } from "libs/context";
import type { Writer } from "libs/io";
import { type Logger, createLogger } from "libs/logger";
import { PyProgram, pyRuntimeFactory } from "python-runtime";

// @ts-ignore
import wasmUrl from "python-runtime/pyodide.wasm";
// @ts-ignore
import stdlibUrl from "python-runtime/python-stdlib.zip";

export class PythonCompilerFactory {
  protected readonly log: Logger;
  constructor(out: Writer) {
    this.log = createLogger(out);
  }

  async create(ctx: Context): Promise<Compiler> {
    const pyRuntime = await pyRuntimeFactory(
      ctx,
      this.log,
      (ctx, imports) =>
        WebAssembly.instantiateStreaming(
          fetch(wasmUrl, { signal: ctx.signal }),
          imports
        ),
      stdlibUrl
    );
    return {
      async compile(_, files) {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new PyProgram(files[0].content, pyRuntime);
      },
      [Symbol.dispose]() {},
    };
  }
}
