import type { File } from 'libs/compiler';

export async function compileJsModule<M>(code: string): Promise<M> {
	return import(/* @vite-ignore */ `data:text/javascript;base64,${btoa(code)}`);
}

const MODULE_EXTENSIONS = ['js', 'mjs'];

const IMPORT_PATTERN = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])([^"']+)\2/g;

function normalize(filename: string): string {
	return filename.replace(new RegExp(`\\.(?:${MODULE_EXTENSIONS.join('|')})$`), '');
}

function resolveSpecifier(specifier: string, filenames: string[]): string | null {
	const name = specifier.replace(/^(?:\.{1,2}\/)+/, '');
	if (filenames.includes(name)) {
		return name;
	}
	const withExtension = MODULE_EXTENSIONS.map((extension) => `${name}.${extension}`).find(
		(candidate) => filenames.includes(candidate)
	);
	if (withExtension !== undefined) {
		return withExtension;
	}
	return filenames.find((filename) => normalize(filename) === normalize(name)) ?? null;
}

function findEntryFile(filenames: string[], entry?: string): string {
	if (entry !== undefined) {
		if (!filenames.includes(entry)) {
			throw new Error(`Entry file "${entry}" is not among provided files`);
		}
		return entry;
	}
	for (const name of ['main', 'index'].flatMap((base) => [
		base,
		...MODULE_EXTENSIONS.map((e) => `${base}.${e}`)
	])) {
		if (filenames.includes(name)) return name;
	}
	return filenames[0];
}

export async function compileJsFiles<M = unknown>(files: File[], entry?: string): Promise<M> {
	const sources = new Map(files.map((file) => [file.filename, file.content]));
	const urls = new Map<string, string>();
	const stack: string[] = [];

	async function compileFile(filename: string): Promise<string> {
		const cached = urls.get(filename);
		if (cached !== undefined) return cached;

		const source = sources.get(filename);
		if (source === undefined) {
			throw new Error(`Unknown module "${filename}"`);
		}
		if (stack.includes(filename)) {
			throw new Error(
				`Circular import detected: ${[...stack.slice(stack.indexOf(filename)), filename].join(' -> ')}`
			);
		}
		stack.push(filename);

		const resolvedImports = new Map<string, string>();
		for (const [, , , specifier] of source.matchAll(IMPORT_PATTERN)) {
			const resolved = resolveSpecifier(specifier, [...sources.keys()]);
			if (resolved !== null) {
				resolvedImports.set(specifier, resolved);
			}
		}
		for (const dependency of new Set(resolvedImports.values())) {
			await compileFile(dependency);
		}

		stack.pop();

		const code = source.replace(IMPORT_PATTERN, (match, prefix, quote, specifier) => {
			const dependency = resolvedImports.get(specifier);
			return dependency === undefined ? match : `${prefix}${quote}${urls.get(dependency)}${quote}`;
		});
		const url = `data:text/javascript;base64,${btoa(code)}`;
		urls.set(filename, url);
		return url;
	}

	if (files.length === 0) {
		throw new Error('No files to compile');
	}

	const entryUrl = await compileFile(findEntryFile([...sources.keys()], entry));
	return import(/* @vite-ignore */ entryUrl);
}
