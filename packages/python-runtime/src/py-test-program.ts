import type { PyProxy } from 'pyodide/ffi';

import type { File } from 'libs/compiler';
import { inContext, type Context } from 'libs/context';
import type { TestProgram } from 'libs/testing';

import { pyEntryFile, writePyFiles, type Pyodide } from './py-program';

function isPyProxy(obj: any): obj is PyProxy {
	return typeof obj === 'object' && obj;
}

export abstract class PyTestProgram<I, O> implements TestProgram<I, O> {
	private proxies: PyProxy[] = [];

	constructor(
		protected readonly python: Pyodide,
		protected readonly files: File[]
	) {}

	protected abstract caseExecutionCode(input: I): string;

	protected get code(): string {
		return pyEntryFile(this.files).content;
	}

	protected transformCode(input: I): string {
		return `${this.code}\n${this.caseExecutionCode(input)}`;
	}

	protected transformResult(result: any): O {
		if (isPyProxy(result)) {
			this.proxies.push(result);
			return result.toJs({ pyproxies: this.proxies });
		}
		return result;
	}

	async run(ctx: Context, input: I): Promise<O> {
		writePyFiles(this.python, this.files);
		return this.transformResult(
			await inContext(ctx, this.python.runPythonAsync(this.transformCode(input)))
		);
	}

	[Symbol.dispose](): void {
		for (const p of this.proxies) {
			p.destroy();
		}
		this.proxies.length = 0;
	}
}
