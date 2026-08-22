import { File as WasiFile, type Inode } from '@bjorn3/browser_wasi_shim';
import type { File } from 'libs/compiler';
import type { Streams } from 'libs/io';
import type { TestProgram } from 'libs/testing';
import { inContext, type Context } from 'libs/context';

import type { CppCompiler } from './cpp-compiler';
import { createProgramWASI } from './wasi';

function encode(content: string): Uint8Array<ArrayBuffer> {
	return new TextEncoder().encode(content) as Uint8Array<ArrayBuffer>;
}

function entryOf(files: File[]): File {
	if (files.length === 1) {
		return files[0];
	}
	for (const base of ['main', 'index']) {
		const entry = files.find(
			(file) => file.filename.replace(/\.(cpp|cc|cxx|c\+\+|c|C)$/i, '') === base
		);
		if (entry !== undefined) {
			return entry;
		}
	}
	return files[0];
}

/**
 * Compiles the user sources together with a generated `main.cpp` harness
 * (the user code must not define its own `main`), executes the result and
 * reads back the output file written by the harness into the working
 * directory of the program.
 */
export abstract class CppTestProgram<I, O> implements TestProgram<I, O> {
	protected textDecoder = new TextDecoder();

	private harnessBody?: string;
	private readonly outputFiles = new Map<string, Inode>();

	constructor(
		protected readonly files: File[],
		protected readonly compiler: CppCompiler,
		protected readonly streams: Streams,
		protected readonly outputPath = 'case_output'
	) {}

	async run(ctx: Context, input: I): Promise<O> {
		this.writeHarness(this.generateHarnessCode(input));
		const program = await this.compiler.compile(ctx, this.filesWithHarness());
		await this.execute(ctx, program);
		return this.readResult();
	}

	protected async execute(ctx: Context, program: Uint8Array): Promise<void> {
		this.outputFiles.clear();
		const module = await inContext(ctx, WebAssembly.compile(program as BufferSource));
		const wasi = createProgramWASI(this.streams, this.outputFiles);
		const instance = await inContext(
			ctx,
			WebAssembly.instantiate(module, {
				wasi_snapshot_preview1: wasi.wasiImport
			})
		);
		// @ts-expect-error lack of type information
		const exitCode = wasi.start(instance);
		if (exitCode !== 0) {
			throw new Error(`Code execution failed with exit code ${exitCode}`);
		}
	}

	protected filesWithHarness(): File[] {
		const harness = `${this.code}

#include <fstream>

int main() {
  ${this.harnessBody!}
  std::ofstream file("${this.outputPath}");
  file << output_content;
  return 0;
}
`;
		return [
			...this.files.filter((file) => file !== entryOf(this.files)),
			{ filename: 'main.cpp', content: harness }
		];
	}

	protected writeHarness(mainBody: string): void {
		this.harnessBody = mainBody;
	}

	/**
	 * Should generate statements computing a `std::string output_content`.
	 * The user code must not define its own `main`.
	 */
	protected abstract generateOutputContentCode(input: I): string;

	protected generateHarnessCode(input: I): string {
		return `std::string output_content;
{
  ${this.generateOutputContentCode(input)}
}`;
	}

	protected get code(): string {
		return entryOf(this.files).content;
	}

	protected readOutputFile() {
		const file = this.outputFiles.get(this.outputPath);
		if (!(file instanceof WasiFile)) {
			throw new Error(`Failed to read output file "${this.outputPath}"`);
		}
		return file;
	}

	protected abstract transformResult(data: string): O;

	protected readResult(): O {
		return this.transformResult(this.textDecoder.decode(this.readOutputFile().data));
	}
}
