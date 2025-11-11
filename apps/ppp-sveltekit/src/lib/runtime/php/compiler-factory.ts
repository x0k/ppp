import type { CompilerFactory, Program } from "libs/compiler";
import { phpCompilerFactory, PHPProgram } from "php-runtime";

export const makePhpCompiler: CompilerFactory<Program> = async (ctx, streams) => {
  const php = await phpCompilerFactory(ctx);
  return {
    async compile(_, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      return new PHPProgram(files[0].content, php, streams);
    },
  };
};
