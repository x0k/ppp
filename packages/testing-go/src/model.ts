export enum LogLevel {
  Disabled = -8,
  Debug = -4,
  Info = 0,
  Warn = 4,
  Error = 8,
}

export interface LoggerConfig {
  level: LogLevel;
  console: globalThis.Console;
}

export interface WriterConfig {
  write: (s: string) => void;
}

export interface CompilerConfig {
  logger: LoggerConfig;
  writer: WriterConfig;
}
