import type { LuaEngine, LuaFactory } from 'wasmoon';
import type { File, Program } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';

export function luaFileName(file: File): string {
	return file.filename.endsWith('.lua') ? file.filename : `${file.filename}.lua`;
}

export function luaEntryFile(files: File[]): File {
	if (files.length === 1) {
		return files[0];
	}
	for (const base of ['main', 'index']) {
		const entry = files.find((file) => file.filename.replace(/\.lua$/, '') === base);
		if (entry !== undefined) {
			return entry;
		}
	}
	return files[0];
}

export class LuaProgram implements Program {
	constructor(
		protected readonly factory: LuaFactory,
		protected readonly engine: LuaEngine,
		protected readonly files: File[]
	) {}

	async run(ctx: Context): Promise<void> {
		const entry = luaEntryFile(this.files);
		for (const file of this.files) {
			if (file !== entry) {
				await this.factory.mountFile(luaFileName(file), file.content);
			}
		}
		await inContext(ctx, this.engine.doString(entry.content));
	}
}
