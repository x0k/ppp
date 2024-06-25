import type { Result } from "libs/result";

import "./vendor/wasm_exec.js";

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

export type Executor<R> = (
  signal: AbortSignal,
  code: string
) => Result<R, string>;

export interface Compiler {
  compile<R>(signal: AbortSignal, code: string): Result<Executor<R>, string>;
}

export type CompilerFactory = (
  config: CompilerConfig
) => Result<Compiler, string>;

export const DEFAULT_GLOBAL_COMPILER_INIT_FUNCTION_NAME =
  "__compiler_init_function";

export async function createCompilerFactory(
  instantiate: (
    importObject: WebAssembly.Imports
  ) => Promise<WebAssembly.Instance>,
  globalCompilerInitFunctionName = DEFAULT_GLOBAL_COMPILER_INIT_FUNCTION_NAME
) {
  const go = new Go();
  go.argv.push(globalCompilerInitFunctionName);
  void go.run(await instantiate(go.importObject));
  // @ts-ignore
  return globalThis[globalCompilerInitFunctionName] as CompilerFactory;
}
