import type { LuaEngine, LuaFactory } from 'wasmoon';
import type { File } from 'libs/compiler';
import type { TestProgram } from 'libs/testing';
import { inContext, type Context } from 'libs/context';

import { luaEntryFile, luaFileName } from './lua-program';

/**
 * Runs the user code followed by a generated case execution snippet that
 * must assign the case result to the global `output_content`.
 */
export abstract class LuaTestProgram<I, O> implements TestProgram<I, O> {
	constructor(
		protected readonly factory: LuaFactory,
		protected readonly engine: LuaEngine,
		protected readonly files: File[]
	) {}

	async run(ctx: Context, input: I): Promise<O> {
		const entry = luaEntryFile(this.files);
		for (const file of this.files) {
			if (file !== entry) {
				await this.factory.mountFile(luaFileName(file), file.content);
			}
		}
		const script = `${entry.content}\n${this.caseExecutionCode(input)}`;
		await inContext(ctx, this.engine.doString(script));
		const result = this.engine.global.get('output_content');
		this.engine.global.set('output_content', undefined);
		return this.transformResult(result);
	}

	protected abstract caseExecutionCode(input: I): string;

	protected abstract transformResult(result: unknown): O;
}
