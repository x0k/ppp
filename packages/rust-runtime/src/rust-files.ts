import { File as WasiFile, OpenDirectory } from '@bjorn3/browser_wasi_shim';
import type { File } from 'libs/compiler';

export function rustFileName(file: File): string {
	return file.filename.endsWith('.rs') ? file.filename : `${file.filename}.rs`;
}

export function rustEntryFile(files: File[]): File {
	if (files.length === 1) {
		return files[0];
	}
	for (const base of ['main', 'index']) {
		const entry = files.find((file) => file.filename.replace(/\.rs$/, '') === base);
		if (entry !== undefined) {
			return entry;
		}
	}
	return files[0];
}

// Writes sources into the WASI root directory. The entry source is always
// placed as `main.rs`, because that is the path miri is invoked with; sibling
// modules are resolved by miri relative to it.
export function writeRustSources(
	dir: OpenDirectory,
	files: File[],
	entry: File,
	entryCode: string
): void {
	const encoder = new TextEncoder();
	for (const file of files) {
		if (file !== entry && file.filename !== 'main') {
			dir.dir.contents.set(rustFileName(file), new WasiFile(encoder.encode(file.content)));
		}
	}
	dir.dir.contents.set('main.rs', new WasiFile(encoder.encode(entryCode)));
}
