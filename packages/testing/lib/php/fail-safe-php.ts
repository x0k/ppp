import { WebPHP, type PHPRuntimeId, type PHPRunOptions } from "@php-wasm/web";

export class FailSafePHP extends WebPHP {
  private lastRuntime: PHPRuntimeId | undefined;

  constructor(private readonly runtimeFactory: () => Promise<PHPRuntimeId>) {
    super();
  }

  override async run(request: PHPRunOptions) {
    if (this.lastRuntime === undefined) {
      this.lastRuntime = await this.runtimeFactory();
      this.initializeRuntime(this.lastRuntime);
    }
    try {
      return await super.run(request);
    } catch (e) {
      this.lastRuntime = await this.runtimeFactory();
      this.hotSwapPHPRuntime(this.lastRuntime);
      throw e;
    }
  }
}
