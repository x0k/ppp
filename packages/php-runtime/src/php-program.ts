import type { PHP } from '@php-wasm/universal';
import type { File, Program } from 'libs/compiler';
import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';

export const PHP_FILES_DIR = '/home';

export function phpFilePath(file: File): string {
	const name = file.filename.endsWith('.php') ? file.filename : `${file.filename}.php`;
	return `${PHP_FILES_DIR}/${name}`;
}

export function phpEntryFile(files: File[]): File {
	if (files.length === 1) {
		return files[0];
	}
	for (const base of ['main', 'index']) {
		const entry = files.find((file) => file.filename.replace(/\.php$/, '') === base);
		if (entry !== undefined) {
			return entry;
		}
	}
	return files[0];
}

export class PHPProgram implements Program {
	constructor(
		protected readonly files: File[],
		protected readonly php: PHP,
		protected readonly streams: Streams
	) {}

	async run(_: Context): Promise<void> {
		for (const file of this.files) {
			this.php.writeFile(phpFilePath(file), file.content);
		}
		const response = await this.php.runStream({
			scriptPath: phpFilePath(phpEntryFile(this.files))
		});
		await Promise.all([
			response.stdout.pipeTo(new WritableStream(this.streams.out)),
			response.stderr.pipeTo(new WritableStream(this.streams.err))
		]);
		const exitCode = await response.exitCode;
		if (exitCode !== 0) {
			throw new Error(`Command failed with exit code ${exitCode}`);
		}
	}
}
