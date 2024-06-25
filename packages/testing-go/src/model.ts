import type { Result } from "libs/result";

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
  write: (s: string) => null | string;
}

export interface CompilerConfig {
  logger: LoggerConfig;
  stdout: WriterConfig;
  stderr: WriterConfig;
}

export type Executor<R> = (
  signal: AbortSignal,
  code: string
) => Promise<Result<R, string>>;

export interface Compiler {
  compile<R>(
    signal: AbortSignal,
    code: string
  ): Promise<Result<Executor<R>, string>>;
}

export type CompilerFactory = (
  config: CompilerConfig
) => Result<Compiler, string>;

export const DEFAULT_GLOBAL_COMPILER_INIT_FUNCTION_NAME =
  "__compiler_init_function";
