import type { Context } from 'libs/context';
import type { Streams } from 'libs/io';
import { createLogger, type Logger } from 'libs/logger';
import type { TestCompiler } from 'libs/testing';
import { pyRuntimeFactory, PyTestProgram } from 'python-runtime';

export type GenerateCaseExecutionCode<I> = (input: I) => string;

export class PythonTestCompilerFactory {
	protected readonly logger: Logger;

	constructor(protected readonly streams: Streams) {
		this.logger = createLogger(streams.out);
	}

	async create<I, O>(
		ctx: Context,
		generateCaseExecutionCode: GenerateCaseExecutionCode<I>
	): Promise<TestCompiler<I, O>> {
		class TestProgram extends PyTestProgram<I, O> {
			protected override caseExecutionCode(data: I): string {
				return generateCaseExecutionCode(data);
			}
		}
		const indexUrl = new URL(
			`${import.meta.env.BASE_URL.replace(/\/$/, '')}/assets/pyodide/`,
			globalThis.location.origin
		).toString();
		const pyRuntime = await pyRuntimeFactory(ctx, this.streams, indexUrl);
		this.logger.info(`Loaded ${indexUrl}`);
		return {
			async compile(_, files) {
				return new TestProgram(pyRuntime, files);
			}
		};
	}
}
