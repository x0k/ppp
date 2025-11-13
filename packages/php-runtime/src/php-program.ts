import type { PHP } from "@php-wasm/universal";
import type { Context } from "libs/context";
import type { Streams } from "libs/io";
import type { Program } from "libs/compiler";

export class PHPProgram implements Program {
  constructor(
    protected readonly code: string,
    protected readonly php: PHP,
    protected readonly streams: Streams
  ) {}

  async run(_: Context): Promise<void> {
    const response = await this.php.runStream({
      code: this.code,
    });
    await Promise.all([
      response.stdout.pipeTo(new WritableStream(this.streams.out)),
      response.stderr.pipeTo(new WritableStream(this.streams.err)),
    ]);
    const exitCode = await response.exitCode;
    if (exitCode !== 0) {
      throw new Error(`Command failed with exit code ${exitCode}`);
    }
  }
}
