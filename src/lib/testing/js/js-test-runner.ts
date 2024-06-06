import type { Logger } from "@/lib/logger";

import type { TestRunner } from "../testing";

function safeStringify(obj: any) {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (_, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    }
  );
}

type ConsoleLogMethod =
  | "log"
  | "info"
  | "warn"
  | "error"
  | "debug"
  | "trace"
  | "assert"
  | "dir";

const CONSOLE_LOGGER_METHOD: Record<ConsoleLogMethod, keyof Logger> = {
  dir: "debug",
  trace: "debug",
  log: "debug",
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
  assert: "error",
};

export abstract class JsTestRunner<M, I, O> implements TestRunner<I, O> {
  private readonly patchedConsole: Console;
  constructor(
    protected readonly logger: Logger,
    protected readonly code: string
  ) {
    this.patchedConsole = new Proxy(globalThis.console, {
      get(target, p, receiver) {
        if (p in CONSOLE_LOGGER_METHOD) {
          const method = CONSOLE_LOGGER_METHOD[p as ConsoleLogMethod];
          if (p === "assert") {
            return (condition: any, ...args: any[]) => {
              if (condition) {
                return;
              }
              const text = args.map(safeStringify).join(" ");
              logger[method](text);
            };
          }
          if (p === "dir") {
            return (arg: any) => {
              logger[method](safeStringify(arg));
            };
          }
          return (...args: any[]) => {
            const text = args.map(safeStringify).join(" ");
            logger[method](text);
          };
        }
        return Reflect.get(target, p, receiver);
      },
    });
  }

  protected transformCode(code: string) {
    return `data:text/javascript;base64,${btoa(code)}`;
  }

  abstract executeTest(m: M, input: I): Promise<O>;

  async run(input: I): Promise<O> {
    const transformedCode = this.transformCode(this.code);
    const originalConsole = globalThis.console;
    globalThis.console = this.patchedConsole
    try {
      const m = await import(/* @vite-ignore */ transformedCode);
      return this.executeTest(m, input);
    } finally {
      globalThis.console = originalConsole;
    }
  }

  [Symbol.dispose](): void {}
}
