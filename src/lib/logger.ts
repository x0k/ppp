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
