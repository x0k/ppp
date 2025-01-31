import {
  initFs,
  JavaCompiler,
  JavaProgram,
  makeJVMFactory,
} from "java-runtime";
import type { CompilerFactory, Program } from "libs/compiler";

// @ts-expect-error vite url import
import libZipUrl from "java-runtime/doppio.zip";

const CLASSNAME = "Program";

export const makeJavaCompiler: CompilerFactory<Program> = async (ctx, streams) => {
  const jvmFactory = makeJVMFactory(streams);
  const libZipData = await fetch(libZipUrl, {
    signal: ctx.signal,
    cache: "force-cache",
  }).then((response) => response.arrayBuffer());
  const fs = await initFs(libZipData);
  const compiler = new JavaCompiler(jvmFactory, `/home/${CLASSNAME}.java`, fs);
  return {
    async compile(ctx, files) {
      if (files.length !== 1) {
        throw new Error("Compilation of multiple files is not implemented");
      }
      await compiler.compile(ctx, files[0].content);
      return new JavaProgram(CLASSNAME, jvmFactory);
    },
  };
};
