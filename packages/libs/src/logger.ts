import { stringify } from "./json.js";

export interface Writer {
  write(text: string): void;
  writeln(text: string): void;
}

export interface Logger {
  debug(text: string): void;
  info(text: string): void;
  warn(text: string): void;
  error(text: string): void;
}

// ANSI color codes for log levels
export const COLOR = {
  DEBUG: "\x1b[32m", // Green
  INFO: "\x1b[34m", // Blue
  WARN: "\x1b[33m", // Yellow
  ERROR: "\x1b[31m", // Red
  RESET: "\x1b[0m", // Reset to default color
};

export function createLogger(writer: Writer): Logger {
  return {
    debug(text) {
      writer.writeln(`${COLOR.DEBUG}[DEBUG]${COLOR.RESET} ${text}`);
    },
    info(text) {
      writer.writeln(`${COLOR.INFO}[INFO]${COLOR.RESET} ${text}`);
    },
    warn(text) {
      writer.writeln(`${COLOR.WARN}[WARN]${COLOR.RESET} ${text}`);
    },
    error(text) {
      writer.writeln(`${COLOR.ERROR}[ERROR]${COLOR.RESET} ${text}`);
    },
  };
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

const safeStringify = (value: any) => stringify(value, 2);

export function redirect(originalConsole: Console, logger: Logger): Console {
  return new Proxy(originalConsole, {
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
