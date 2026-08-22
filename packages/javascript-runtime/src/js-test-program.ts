import type { File } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';
import { compileJsFiles } from 'libs/js';
import { patch } from 'libs/patcher';

import type { TestProgram } from 'libs/testing';

export abstract class JsTestProgram<M, I, O> implements TestProgram<I, O> {
	protected m: M | null = null;

	constructor(
		protected readonly files: File[],
		protected readonly patchedConsole: Console
	) {}

	protected compile(files: File[]): Promise<M> {
		return compileJsFiles<M>(files);
	}

	abstract executeTest(m: M, input: I): Promise<O>;

	async run(ctx: Context, input: I): Promise<O> {
		using _ = patch(globalThis, 'console', this.patchedConsole);
		if (this.m === null) {
			this.m = await this.compile(this.files);
		}
		return await inContext(ctx, this.executeTest(this.m, input));
	}
}
