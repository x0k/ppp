import { Fd, WASI, OpenDirectory, File } from "@bjorn3/browser_wasi_shim";
import type { TestProgram } from "testing";

import { inContext, type Context } from "libs/context";
import { isErr } from "libs/result";

import { assertOpenDir, lookupFile } from "./wasi";

export abstract class RustTestProgram<I, O> implements TestProgram<I, O> {
  protected threads_count = 1;

  constructor(
    protected readonly code: string,
    protected readonly wasi: WASI,
    protected readonly miriModule: WebAssembly.Module,
    protected readonly outputPath: string
  ) {}

  async run(ctx: Context, input: I): Promise<O> {
    this.threads_count = 1;
    this.writeCaseExecutionCode(this.generateCaseExecutionCode(input));
    const instance = await inContext(
      ctx,
      WebAssembly.instantiate(this.miriModule, {
        env: {
          memory: new WebAssembly.Memory({ initial: 256, shared: false }),
        },
        wasi: {
          "thread-spawn": (start_arg: unknown) => {
            let id = this.threads_count++;
            // @ts-ignore
            instance.exports.wasi_thread_start(id, start_arg);
            return id;
          },
        },
        wasi_snapshot_preview1: this.wasi.wasiImport,
      })
    );
    // @ts-expect-error lack of type information
    const exitCode = this.wasi.start(instance);
    if (exitCode !== 0) {
      throw new Error(`Code execution failed with exit code ${exitCode}`);
    }
    return this.readResult();
  }

  protected get stdin(): Fd {
    return this.wasi.fds[0];
  }

  protected get stdout(): Fd {
    return this.wasi.fds[1];
  }

  protected get stderr(): Fd {
    return this.wasi.fds[2];
  }

  protected get tmpDir(): OpenDirectory {
    const dir = this.wasi.fds[3];
    assertOpenDir(dir);
    return dir;
  }

  protected get sysroot(): OpenDirectory {
    const dir = this.wasi.fds[4];
    assertOpenDir(dir);
    return dir;
  }

  protected get rootDir(): OpenDirectory {
    const dir = this.wasi.fds[5];
    assertOpenDir(dir);
    return dir;
  }

  /**
   * Should generate a code that produces a variable `output_content: &[u8]`
   */
  protected abstract generateOutputContentCode(input: I): string;

  protected generateCaseExecutionCode(input: I): string {
    return `${this.code}

fn main() -> Result<(), Box<dyn std::error::Error>> {
  ${this.generateOutputContentCode(input)}
  let mut output_file = std::fs::File::create("${this.outputPath}")?;
  use std::io::Write;
  output_file.write_all(output_content)?;
  Ok(())
}
`;
  }

  protected writeCaseExecutionCode(code: string) {
    const file = lookupFile(this.rootDir, "main.rs");
    if (isErr(file)) {
      throw new Error(`Failed to read main file: ${file.error}`);
    }
    file.value.data = new TextEncoder().encode(code);
  }

  protected abstract transformResult(data: string): O;

  protected readOutputFile(): File {
    const file = lookupFile(this.rootDir, this.outputPath);
    if (isErr(file)) {
      throw new Error(`Failed to read output file: ${file.error}`);
    }
    return file.value;
  }

  protected decodeFileContent(file: File): string {
    return new TextDecoder("utf-8").decode(file.data);
  }

  protected readResult(): O {
    const file = this.readOutputFile();
    const content = this.decodeFileContent(file);
    return this.transformResult(content);
  }
}
