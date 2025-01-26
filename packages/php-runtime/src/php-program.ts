import type { PHP } from "@php-wasm/universal";
import type { Context } from "libs/context";
import type { Writer } from "libs/io";
import type { Program } from "compiler";

export class PHPProgram implements Program {
  constructor(
    protected readonly code: string,
    protected readonly php: PHP,
    protected readonly writer: Writer
  ) {}

  async run(_: Context): Promise<void> {
    const response = await this.php.run({ code: this.code });
    const text = response.bytes;
    if (text.byteLength > 0) {
      this.writer.write(new Uint8Array(text));
    }
    if (response.errors) {
      throw new Error(response.errors);
    }
  }
}
