import type { Context } from 'libs/context';
import type { Result } from 'libs/result';
import type { File } from 'libs/compiler';
import type { Reader, Streams, Writer } from 'libs/io';

export enum LogLevel {
	Disabled = -8,
	Debug = -4,
	Info = 0,
	Warn = 4,
	Error = 8
}

export interface LoggerConfig {
	level: LogLevel;
	console: globalThis.Console;
}

export interface CompilerConfig {
	logger: LoggerConfig;
	stdin: Reader;
	stdout: Writer;
	stderr: Writer;
}

export type Evaluator<O> = (signal: AbortSignal, code: string) => Promise<Result<O, string>>;

export type Executor = (signal: AbortSignal) => Promise<Result<0, string>>;

export interface Compiler {
	createEvaluator<O>(signal: AbortSignal, files: File[]): Promise<Result<Evaluator<O>, string>>;
	createExecutor(signal: AbortSignal, files: File[]): Promise<Result<Executor, string>>;
}

export type CompilerFactory = (config: CompilerConfig) => Result<Compiler, string>;

export type GoCompilerFactory = (streams: Streams) => Compiler;

export type GoProgramFactory<R> = (ctx: Context, streams: Streams, files: File[]) => Promise<R>;

export const DEFAULT_GLOBAL_COMPILER_INIT_FUNCTION_NAME = '__compiler_init_function';
