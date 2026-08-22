import type { loadPyodide } from 'pyodide';
import type { File, Program } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';

export const PY_FILES_DIR = '/home';

type Pyodide = Awaited<ReturnType<typeof loadPyodide>>;

export type { Pyodide };

export function pyFilePath(file: File): string {
	const name = file.filename.endsWith('.py') ? file.filename : `${file.filename}.py`;
	return `${PY_FILES_DIR}/${name}`;
}

export function pyEntryFile(files: File[]): File {
	if (files.length === 1) {
		return files[0];
	}
	for (const base of ['main', 'index']) {
		const entry = files.find((file) => file.filename.replace(/\.py$/, '') === base);
		if (entry !== undefined) {
			return entry;
		}
	}
	return files[0];
}

export function writePyFiles(python: Pyodide, files: File[]): void {
	try {
		python.FS.mkdirTree(PY_FILES_DIR);
	} catch {
		// Already exists.
	}
	for (const file of files) {
		python.FS.writeFile(pyFilePath(file), file.content);
	}
}

// Makes sibling imports of multi-file programs resolvable.
const PATH_PREAMBLE = `import sys
if "${PY_FILES_DIR}" not in sys.path:
    sys.path.insert(0, "${PY_FILES_DIR}")`;

export class PyProgram implements Program {
	constructor(
		protected readonly files: File[],
		protected readonly python: Pyodide
	) {}

	async run(ctx: Context): Promise<void> {
		writePyFiles(this.python, this.files);
		await this.python.runPythonAsync(PATH_PREAMBLE);
		await inContext(ctx, this.python.runPythonAsync(pyEntryFile(this.files).content));
	}
}
