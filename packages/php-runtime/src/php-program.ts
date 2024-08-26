import type { PHP } from "@php-wasm/universal";
import type { Program } from "compiler";
import type { Context } from "libs/context";
import type { Writer } from "libs/io";

export class PHPProgram implements Program {
  constructor(
    protected readonly code: string,
    protected readonly php: PHP,
    protected readonly writer: Writer
  ) {}

  async run(ctx: Context): Promise<void> {
    const exitSubscription = ctx.onCancel(() => this.php.exit(137));
    try {
      const response = await this.php.run({ code: this.code });
      const text = response.bytes;
      if (text.byteLength > 0) {
        this.writer.write(new Uint8Array(text));
      }
      if (response.errors) {
        throw new Error(response.errors);
      }
    } finally {
      exitSubscription[Symbol.dispose]();
    }
  }

  [Symbol.dispose](): void {}
}
