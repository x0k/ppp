import type { OpenDirectory, WASI } from '@bjorn3/browser_wasi_shim';
import type { File } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';
import { isErr } from 'libs/result';
import { assertOpenDir, lookupFile } from 'libs/wasi';

import { writeZigSources, zigEntryFile } from './zig-files';

export class ZigCompiler {
	protected textEncoder = new TextEncoder();

	constructor(
		protected readonly wasi: WASI,
		protected readonly zigModule: WebAssembly.Module
	) {}

	async compile(ctx: Context, files: File[]) {
		this.writeSources(files);
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

	protected writeSources(files: File[]) {
		const entry = zigEntryFile(files);
		writeZigSources(this.rootDir, files, entry, entry.content);
	}

	protected getWasmFile() {
		const file = lookupFile(this.rootDir, 'main.wasm');
		if (isErr(file)) {
			throw new Error(`Failed to read compiled file: ${file.error}`);
		}
		return file.value;
	}
}
