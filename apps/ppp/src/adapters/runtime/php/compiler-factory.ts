import { inContext } from "libs/context";
import type { CompilerFactory } from "compiler";
import { phpCompilerFactory, PHPProgram } from "php-runtime";

export const makePhpCompiler: CompilerFactory = async (ctx, out) => {
  const php = await inContext(ctx, phpCompilerFactory());
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new PHPProgram(files[0].content, php, out);
    },
    [Symbol.dispose]() {
      php[Symbol.dispose]();
    },
  };
};
