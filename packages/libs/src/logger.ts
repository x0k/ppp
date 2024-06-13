import { stringify } from 'libs/json';

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
const colors = {
    debug: '\x1b[32m', // Green
    info: '\x1b[34m',  // Blue
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m'   // Reset to default color
};

export function createLogger(writer: Writer): Logger {
  return {
    debug(text) {
      writer.writeln(`${colors.debug}[DEBUG]${colors.reset} ${text}`);
    },
    info(text) {
      writer.writeln(`${colors.info}[INFO]${colors.reset} ${text}`);
    },
    warn(text) {
      writer.writeln(`${colors.warn}[WARN]${colors.reset} ${text}`);
    },
    error(text) {
      writer.writeln(`${colors.error}[ERROR]${colors.reset} ${text}`);
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
