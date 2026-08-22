import type { File } from 'libs/compiler';
import { inContext, withCancel, type Context } from 'libs/context';

import { FSModule } from './fs';
import { JVMFactory } from './jvm-factory';

export class JavaCompiler {
	private lastSourcesKey: string | null = null;

	constructor(
		protected readonly jvmFactory: JVMFactory,
		protected readonly fs: FSModule
	) {}

	// Skips javac entirely when the sources are unchanged since the last
	// successful compilation and compiled classes are still present.
	async compile(ctx: Context, files: File[]) {
		const key = files.map((file) => `${file.filename}\u0000${file.content}`).join('\u0001');
		if (key === this.lastSourcesKey && this.hasClasses()) {
			return;
		}
		const paths = files.map((file) => this.writeFile(file));
		// The JVM is single-use: cancel its context when done so the
		// factory disposes its stdio wiring, otherwise output leaks
		// into subsequent runs.
		const [jvmCtx, cancel] = withCancel(ctx);
		const jvm = await this.jvmFactory(jvmCtx);
		const code = await inContext(
			jvmCtx,
			new Promise<number>((resolve) => {
				jvm.runClass('util.Javac', paths, resolve);
			})
		).finally(cancel);
		if (code !== 0) {
			throw new Error('Compilation failed');
		}
		this.lastSourcesKey = key;
	}

	protected writeFile(file: File): string {
		const name = file.filename.endsWith('.java') ? file.filename : `${file.filename}.java`;
		const path = `/home/${name}`;
		this.fs.writeFileSync(path, file.content);
		return path;
	}

	private hasClasses(): boolean {
		try {
			return this.fs.readdirSync('/home').some((name) => name.endsWith('.class'));
		} catch {
			return false;
		}
	}
}
