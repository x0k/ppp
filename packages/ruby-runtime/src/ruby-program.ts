import { RubyVM } from '@ruby/wasm-wasi';
import type { File, Program } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';

import { rubyEntryFile, rubyFilePath } from './ruby-vm-factory';

export class RubyProgram implements Program {
	constructor(
		protected readonly files: File[],
		protected readonly rubyVm: RubyVM
	) {}

	async run(ctx: Context): Promise<void> {
		const entry = rubyFilePath(rubyEntryFile(this.files));
		// The entry is loaded from the VM filesystem rather than evaluated
		// inline, so require_relative works across the program files.
		await inContext(ctx, this.rubyVm.evalAsync(`load '${entry}'`));
	}
}
