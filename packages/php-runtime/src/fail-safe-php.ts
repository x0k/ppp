import { WebPHP, type PHPRuntimeId, type PHPRunOptions } from "@php-wasm/web";

export class FailSafePHP extends WebPHP {
  private lastRuntime: PHPRuntimeId | undefined;

  constructor(private readonly runtimeFactory: () => Promise<PHPRuntimeId>) {
    super();
  }

  async initialize() {
    if (this.lastRuntime !== undefined) {
      return;
    }
    this.lastRuntime = await this.runtimeFactory();
    this.initializeRuntime(this.lastRuntime);
  }

  override async run(request: PHPRunOptions) {
    await this.initialize();
    try {
      return await super.run(request);
    } catch (e) {
      this.lastRuntime = await this.runtimeFactory();
      this.hotSwapPHPRuntime(this.lastRuntime);
      throw e;
    }
  }
}
