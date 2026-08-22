import type { File } from 'libs/compiler';
import type { Streams } from 'libs/io';
import { compileJsFiles } from 'libs/js';
import { createLogger, redirect } from 'libs/logger';
import type { TestCompiler } from 'libs/testing';
import { JsTestProgram } from 'javascript-runtime';
import { compileTsModule } from 'typescript-runtime';

export type InvokeTestMethod<M, I, O> = (m: M, input: I) => Promise<O>;

export class TsTestCompilerFactory {
	protected readonly patchedConsole: Console;

	constructor(streams: Streams) {
		this.patchedConsole = redirect(globalThis.console, createLogger(streams.out));
	}

	create<M, I, O>(invokeTestMethod: InvokeTestMethod<M, I, O>): TestCompiler<I, O> {
		class TestProgram extends JsTestProgram<M, I, O> {
			protected override async compile(files: File[]): Promise<M> {
				const modules = files.map((file) => ({
					filename: file.filename,
					content: compileTsModule(file.content)
				}));
				return await compileJsFiles<M>(modules);
			}
			override async executeTest(m: M, input: I): Promise<O> {
				return invokeTestMethod(m, input);
			}
		}
		return {
			compile: async (_, files) => {
				return new TestProgram(files, this.patchedConsole);
			}
		};
	}
}
