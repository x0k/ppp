import type { File, Program } from 'libs/compiler';
import type { Context } from 'libs/context';
import { compileJsFiles } from 'libs/js';
import { patch } from 'libs/patcher';

export class JsProgram implements Program {
	constructor(
		protected readonly files: File[],
		protected readonly patchedConsole: Console
	) {}

	async run(_ctx: Context): Promise<void> {
		using _ = patch(globalThis, 'console', this.patchedConsole);
		await compileJsFiles(this.files);
	}
}
