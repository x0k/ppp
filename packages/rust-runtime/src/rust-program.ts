import type { OpenDirectory, WASI } from '@bjorn3/browser_wasi_shim';
import type { File, Program } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';
import { isErr } from 'libs/result';
import { assertOpenDir } from 'libs/wasi';

import { rustEntryFile, writeRustSources } from './rust-files';

// TODO: extract common code with RustTestProgram
export class RustProgram implements Program {
	protected threads_count = 1;

	constructor(
		protected readonly files: File[],
		protected readonly wasi: WASI,
		protected readonly miriModule: WebAssembly.Module
	) {}

	async run(ctx: Context): Promise<void> {
		this.threads_count = 1;
		this.writeSources(this.files);
		const instance = await inContext(
			ctx,
			WebAssembly.instantiate(this.miriModule, {
				env: {
					memory: new WebAssembly.Memory({ initial: 256, shared: false })
				},
				wasi: {
					'thread-spawn': (start_arg: unknown) => {
						let id = this.threads_count++;
						// @ts-ignore
						instance.exports.wasi_thread_start(id, start_arg);
						return id;
					}
				},
				wasi_snapshot_preview1: this.wasi.wasiImport
			})
		);
		// @ts-expect-error lack of type information
		const exitCode = this.wasi.start(instance);
		if (exitCode !== 0) {
			throw new Error(`Code execution failed with exit code ${exitCode}`);
		}
	}

	protected get rootDir(): OpenDirectory {
		const dir = this.wasi.fds[5];
		assertOpenDir(dir);
		return dir;
	}

	protected writeSources(files: File[]) {
		const entry = rustEntryFile(files);
		writeRustSources(this.rootDir, files, entry, entry.content);
	}
}
