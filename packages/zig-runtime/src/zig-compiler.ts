import type { OpenDirectory, WASI } from '@bjorn3/browser_wasi_shim';
import { inContext, type Context } from 'libs/context';
import { isErr } from 'libs/result';
import { assertOpenDir, lookupFile } from 'libs/wasi';

export class ZigCompiler {
	protected textEncoder = new TextEncoder();

	constructor(
		protected readonly wasi: WASI,
		protected readonly zigModule: WebAssembly.Module
	) {}

	async compile(ctx: Context, source: string) {
		this.writeSourceCode(source);
		const instance = await inContext(
			ctx,
			WebAssembly.instantiate(this.zigModule, {
				wasi_snapshot_preview1: this.wasi.wasiImport
			})
		);
		// @ts-expect-error lack of type information
		const exitCode = this.wasi.start(instance);
		if (exitCode !== 0) {
			throw new Error(`Code execution failed with exit code ${exitCode}`);
		}
		return this.getWasmFile().data;
	}

	protected get rootDir(): OpenDirectory {
		const dir = this.wasi.fds[3];
		assertOpenDir(dir);
		return dir;
	}

	protected writeSourceCode(code: string) {
		const file = lookupFile(this.rootDir, 'main.zig');
		if (isErr(file)) {
			throw new Error(`Failed to read main file: ${file.error}`);
		}
		file.value.data = this.textEncoder.encode(code);
	}

	protected getWasmFile() {
		const file = lookupFile(this.rootDir, 'main.wasm');
		if (isErr(file)) {
			throw new Error(`Failed to read compiled file: ${file.error}`);
		}
		return file.value;
	}
}
