import type { Compiler } from "libs/compiler";
import { inContext, type Context } from "libs/context";
import type { Writer } from "libs/io";
import { phpCompilerFactory, PHPProgram } from "php-runtime";

export class PhpCompilerFactory {
  constructor(protected readonly out: Writer) {}

  async create(ctx: Context): Promise<Compiler> {
    const php = await inContext(ctx, phpCompilerFactory());
    return {
      compile: async (ctx, files) => {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        return new PHPProgram(files[0].content, php, this.out);
      },
      [Symbol.dispose]() {
        php[Symbol.dispose]();
      },
    };
  }
}
