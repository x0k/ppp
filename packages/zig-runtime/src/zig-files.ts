import { File as WasiFile, OpenDirectory } from '@bjorn3/browser_wasi_shim';
import type { File } from 'libs/compiler';

export function zigFileName(file: File): string {
	return file.filename.endsWith('.zig') ? file.filename : `${file.filename}.zig`;
}

export function zigEntryFile(files: File[]): File {
	if (files.length === 1) {
		return files[0];
	}
	for (const base of ['main', 'index']) {
		const entry = files.find((file) => file.filename.replace(/\.zig$/, '') === base);
		if (entry !== undefined) {
			return entry;
		}
	}
	return files[0];
}

// Writes sources into the WASI compiler root directory. The entry source is
// always placed as `main.zig`, because that is the path `zig build-exe` is
// invoked with; sibling `@import` files are resolved by the compiler relative
// to it.
export function writeZigSources(
	dir: OpenDirectory,
	files: File[],
	entry: File,
	entryCode: string
): void {
	const encoder = new TextEncoder();
	for (const file of files) {
		if (file !== entry && file.filename !== 'main') {
			dir.dir.contents.set(zigFileName(file), new WasiFile(encoder.encode(file.content)));
		}
	}
	dir.dir.contents.set('main.zig', new WasiFile(encoder.encode(entryCode)));
}
