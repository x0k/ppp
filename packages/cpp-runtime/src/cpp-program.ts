import type { WASI } from '@bjorn3/browser_wasi_shim';
import type { Program } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';

export class CppProgram implements Program {
	constructor(
		protected readonly wasi: WASI,
		protected readonly program: Uint8Array<ArrayBuffer>
	) {}

	async run(ctx: Context): Promise<void> {
		const module = await inContext(ctx, WebAssembly.compile(this.program));
		const instance = await inContext(
			ctx,
			WebAssembly.instantiate(module, {
				wasi_snapshot_preview1: this.wasi.wasiImport
			})
		);
		// @ts-expect-error lack of type information
		const exitCode = this.wasi.start(instance);
		if (exitCode !== 0) {
			throw new Error(`Code execution failed with exit code ${exitCode}`);
		}
	}
}
