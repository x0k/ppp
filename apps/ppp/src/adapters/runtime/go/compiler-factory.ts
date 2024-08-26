import {
  GoProgram,
  makeCompilerFactory,
  makeGoCompilerFactory,
  makeGoExecutorFactory,
} from "go-runtime";
import type { Compiler } from "libs/compiler";
import { inContext, type Context } from "libs/context";
import type { Writer } from "libs/io";

import wasmInit from "go-runtime/compiler.wasm?init";

export class CompilerFactory {
  constructor(protected readonly out: Writer) {}

  async create(ctx: Context): Promise<Compiler> {
    const goExecutorFactory = makeGoExecutorFactory(
      makeGoCompilerFactory(
        await makeCompilerFactory((imports) =>
          inContext(ctx, wasmInit(imports))
        )
      )
    );
    return {
      compile: async (ctx, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new GoProgram(
          await goExecutorFactory(ctx, this.out, files[0].content)
        );
      },
      [Symbol.dispose]() {},
    };
  }
}
