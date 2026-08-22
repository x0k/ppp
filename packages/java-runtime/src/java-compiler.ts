import type { File } from 'libs/compiler';
import { Context, withCancel } from 'libs/context';

import { FSModule } from './fs';
import { JVMFactory } from './jvm-factory';

export class JavaCompiler {
	constructor(
		protected readonly jvmFactory: JVMFactory,
		protected readonly fs: FSModule
	) {}

	async compile(ctx: Context, files: File[]) {
		const paths = files.map((file) => this.writeFile(file));
		const [jvmCtx, cancel] = withCancel(ctx);
		const jvm = await this.jvmFactory(jvmCtx);
		return new Promise<void>((resolve, reject) => {
			jvm.runClass('util.Javac', paths, (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error('Compilation failed'));
				}
			});
		}).finally(cancel);
	}

	protected writeFile(file: File): string {
		const name = file.filename.endsWith('.java') ? file.filename : `${file.filename}.java`;
		const path = `/home/${name}`;
		this.fs.writeFileSync(path, file.content);
		return path;
	}
}
