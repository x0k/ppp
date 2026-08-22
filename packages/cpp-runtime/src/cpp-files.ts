import type { File } from 'libs/compiler';

const CPP_EXTENSIONS = ['.cpp', '.cc', '.cxx', '.c++', '.c', '.C'];

export function cppFileName(file: File): string {
	const lower = file.filename.toLowerCase();
	for (const ext of CPP_EXTENSIONS) {
		if (lower.endsWith(ext.toLowerCase())) {
			return file.filename;
		}
	}
	return `${file.filename}.cpp`;
}

export function cppEntryFile(files: File[]): File {
	if (files.length === 1) {
		return files[0];
	}
	for (const base of ['main', 'index']) {
		const entry = files.find((file) => {
			const name = file.filename.replace(/\.(cpp|cc|cxx|c\+\+|c|C)$/, '');
			return name === base;
		});
		if (entry !== undefined) {
			return entry;
		}
	}
	return files[0];
}

// Writes sources into the compiler virtual filesystem. The entry source is
// always placed as `main.cpp`, because that is the path the compiler driver
// is invoked with; relative includes are resolved next to it.
export function writeCppSources(
	fs: { writeFile(path: string, data: string | Uint8Array): void },
	files: File[],
	entry: File,
	entryCode: string
): void {
	const encoder = new TextEncoder();
	for (const file of files) {
		if (file !== entry) {
			fs.writeFile(cppFileName(file), encoder.encode(file.content));
		}
	}
	fs.writeFile('main.cpp', encoder.encode(entryCode));
}
