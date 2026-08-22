import { RubyVM } from '@ruby/wasm-wasi';
import {
	ConsoleStdout,
	Fd,
	File as WasiFile,
	PreopenDirectory,
	WASI
} from '@bjorn3/browser_wasi_shim';
import type { File } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';
import type { Streams } from 'libs/io';
import { Stdin } from 'libs/wasi';

export function rubyFilePath(file: File): string {
	const name = file.filename.endsWith('.rb') ? file.filename : `${file.filename}.rb`;
	return `/${name}`;
}

export function rubyEntryFile(files: File[]): File {
	if (files.length === 1) {
		return files[0];
	}
	for (const base of ['main', 'index']) {
		const entry = files.find((file) => file.filename.replace(/\.rb$/, '') === base);
		if (entry !== undefined) {
			return entry;
		}
	}
	return files[0];
}

// https://github.com/ruby/ruby.wasm/blob/ef0300af384779db2e5de1e8c4528597d28eabe2/packages/npm-packages/ruby-wasm-wasi/src/vm.ts#L126
export async function createRubyVM(
	ctx: Context,
	streams: Streams,
	wasmModule: WebAssembly.Module,
	files: File[] = []
) {
	const args: string[] = [];
	const env: string[] = [];

	const rootContents = new Map<string, WasiFile>();
	const encoder = new TextEncoder();
	for (const file of files) {
		rootContents.set(rubyFilePath(file).slice(1), new WasiFile(encoder.encode(file.content)));
	}

	const fds: Fd[] = [
		new Stdin(streams.in.read.bind(streams.in)),
		new ConsoleStdout(streams.out.write.bind(streams.out)),
		new ConsoleStdout(streams.err.write.bind(streams.err)),
		new PreopenDirectory('/', rootContents)
	];
	const wasi = new WASI(args, env, fds, { debug: false });
	const vm = new RubyVM();
	const imports = {
		wasi_snapshot_preview1: wasi.wasiImport
	};
	vm.addToImports(imports);

	const instance = await inContext(ctx, WebAssembly.instantiate(wasmModule, imports));
	await inContext(ctx, vm.setInstance(instance));

	//@ts-expect-error lack of type information
	wasi.initialize(instance);
	vm.initialize();

	return vm;
}
