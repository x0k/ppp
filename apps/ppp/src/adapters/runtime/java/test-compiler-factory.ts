import type { Context } from "libs/context";
import type { Streams } from "libs/io";
import type { TestCompiler } from "libs/testing";

import {
  JavaCompiler,
  JavaTestProgram,
  initFs,
  makeJVMFactory,
} from "java-runtime";

// @ts-expect-error vite url import
import libZipUrl from "java-runtime/doppio.zip";

export interface Options<I, O> {
  className?: string;
  classDefinitions: string;
  mainMethodBody: string;
  nativesFactory: (
    input: I,
    saveOutput: (output: O) => void
  ) => Record<string, Function>;
}

export class JavaTestCompilerFactory {
  constructor(private readonly streams: Streams) {}
  async create<I, O>(
    ctx: Context,
    {
      className = "Test",
      classDefinitions,
      mainMethodBody,
      nativesFactory,
    }: Options<I, O>
  ): Promise<TestCompiler<I, O>> {
    const jvmFactory = makeJVMFactory(this.streams);
    const libZipData = await fetch(libZipUrl, {
      signal: ctx.signal,
      cache: "force-cache",
    }).then((response) => response.arrayBuffer());
    const fs = await initFs(libZipData);
    const compiler = new JavaCompiler(
      jvmFactory,
      `/home/${className}.java`,
      fs
    );
    class TestProgram extends JavaTestProgram<I, O> implements Disposable {
      private output?: O;
      private saveOutput(output: O) {
        this.output = output;
      }
      protected override getNatives(input: I): Record<string, Function> {
        this.output = undefined;
        return nativesFactory(input, this.saveOutput.bind(this));
      }
      protected override getResult(): O {
        if (this.output === undefined) {
          throw new Error("No output");
        }
        return this.output;
      }
      [Symbol.dispose]() {
        this.output = undefined;
      }
    }
    return {
      async compile(ctx, files) {
        if (files.length !== 1) {
          throw new Error("Compilation of multiple files is not implemented");
        }
        // TODO: Fix handling compilation errors or at least remove previous
        // compilation output
        await compiler.compile(
          ctx,
          `${files[0].content}

public class ${className} {
  ${classDefinitions}
  public static void main(String[] args) {
    ${mainMethodBody}
  }
}`
        );
        const program = new TestProgram(className, jvmFactory);
        ctx.onCancel(() => {
          program[Symbol.dispose]()
        });
        return program
      },
    };
  }
}
