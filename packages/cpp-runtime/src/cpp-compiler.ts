import type { File } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';

import { cppEntryFile, writeCppSources } from './cpp-files';
import { setUpSysroot } from './sysroot';
import Clang from './vendor/clang.js';
import LLD from './vendor/lld.js';

// Adapted from browsercc (https://github.com/BertalanD/browsercc, MIT):
// the clang driver is executed with `-###` to obtain the exact cc1 and
// wasm-ld invocations, then both tools are run against the WASI sysroot.

export interface CppCompilerOptions {
	/** Additional driver flags, e.g. ['-std=c++20', '-O2'] */
	flags?: string[];
}

interface Invocation {
	cc1Args: string[];
	objectFile: string;
	linkerArgs: string[];
	outputFile: string;
}

export class CppCompiler {
	protected readonly flags: string[];

	constructor(
		protected readonly clangWasmBinary: ArrayBuffer,
		protected readonly lldWasmBinary: ArrayBuffer,
		protected readonly sysrootTar: ArrayBuffer,
		options: CppCompilerOptions = {}
	) {
		this.flags = options.flags ?? ['-std=c++20', '-fno-exceptions'];
	}

	async compile(ctx: Context, files: File[]): Promise<Uint8Array> {
		const entry = cppEntryFile(files);
		const invocation = await this.getInvocation(ctx, entry.content);
		const objectFile = await this.runClang(ctx, invocation, files, entry);
		return this.runLld(ctx, invocation, objectFile);
	}

	protected async getInvocation(ctx: Context, source: string): Promise<Invocation> {
		let stderr = '';
		const clang = await inContext(
			ctx,
			Clang({
				wasmBinary: this.clangWasmBinary,
				thisProgram: 'clang++',
				printErr: (text) => {
					stderr += text + '\n';
				}
			})
		);
		clang.FS.writeFile('main.cpp', source);

		// A dummy sysroot so the driver finds the paths it needs.
		clang.FS.mkdirTree('/lib/wasm32-wasi');
		clang.FS.mkdirTree('/include/c++/v1');
		clang.FS.writeFile('/lib/wasm32-wasi/crt1-command.o', new Uint8Array(0));
		clang.FS.writeFile('/lib/wasm32-wasi/crt1-reactor.o', new Uint8Array(0));

		const exitCode = clang.callMain(['main.cpp', ...this.flags, '-###']);
		if (exitCode !== 0) {
			throw new Error(`Clang driver failed with code ${exitCode}`);
		}

		const getArgs = (key: string): { args: string[]; output: string } => {
			const line = stderr.split('\n').find((line) => line.includes(key));
			if (line === undefined) {
				throw new Error(`Failed to parse clang driver output for "${key}"`);
			}
			const args =
				line
					.match(/"([^"]*)"/g)
					?.map((arg) => arg.slice(1, -1))
					.slice(1) ?? [];
			const oIndex = args.findIndex((arg) => arg === '-o');
			if (oIndex === -1 || args[oIndex + 1] === undefined) {
				throw new Error(`Failed to parse output file for "${key}"`);
			}
			return { args, output: args[oIndex + 1]! };
		};

		const cc1 = getArgs('-cc1');
		const linker = getArgs('wasm-ld');
		return {
			cc1Args: cc1.args,
			objectFile: cc1.output,
			linkerArgs: linker.args,
			outputFile: linker.output
		};
	}

	protected async runClang(
		ctx: Context,
		invocation: Invocation,
		files: File[],
		entry: File
	): Promise<Uint8Array> {
		const clang = await inContext(
			ctx,
			Clang({ wasmBinary: this.clangWasmBinary, thisProgram: 'clang++' })
		);
		setUpSysroot(clang.FS, this.sysrootTar);
		writeCppSources(clang.FS, files, entry, entry.content);

		const exitCode = clang.callMain(invocation.cc1Args);
		if (exitCode !== 0) {
			throw new Error('Compilation failed');
		}
		return clang.FS.readFile(invocation.objectFile, { encoding: 'binary' });
	}

	protected async runLld(
		ctx: Context,
		invocation: Invocation,
		objectFile: Uint8Array
	): Promise<Uint8Array> {
		const lld = await inContext(
			ctx,
			LLD({ wasmBinary: this.lldWasmBinary, thisProgram: 'wasm-ld' })
		);
		setUpSysroot(lld.FS, this.sysrootTar);
		lld.FS.writeFile(invocation.objectFile, objectFile);

		const exitCode = lld.callMain(invocation.linkerArgs);
		if (exitCode !== 0) {
			throw new Error('Linking failed');
		}
		return lld.FS.readFile(invocation.outputFile, { encoding: 'binary' });
	}
}
