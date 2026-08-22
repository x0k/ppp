import type { File } from 'libs/compiler';
import type { Context } from 'libs/context';

import type { DotnetCompiler } from './dotnet-compiler-factory';

export type DotnetRuntime = Omit<DotnetCompiler, 'Compile' | 'DisposeAssembly'>;

export class DotnetRuntimeFactory {
	constructor(protected readonly compiler: DotnetCompiler) {}

	create(ctx: Context, files: File[]): DotnetRuntime {
		ctx.onCancel(() => {
			this.compiler.DisposeAssembly();
		});
		const status = this.compiler.Compile(files.map((file) => file.content));
		if (status !== 0) {
			throw new Error('Compilation failed');
		}
		return this.compiler;
	}
}
