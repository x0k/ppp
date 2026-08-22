import type { PHP } from '@php-wasm/universal';
import type { File } from 'libs/compiler';
import type { Streams } from 'libs/io';
import type { Context } from 'libs/context';
import type { TestProgram } from 'libs/testing';

import { phpEntryFile, phpFilePath } from './php-program';

export abstract class PHPTestProgram<I, O> implements TestProgram<I, O> {
	private result?: O;
	private disposeOnMessage: () => Promise<void>;

	constructor(
		protected readonly streams: Streams,
		protected readonly php: PHP,
		protected readonly files: File[]
	) {
		this.disposeOnMessage = php.onMessage(this.handleResult.bind(this));
	}

	protected caseExecutionCode(_input: I): string {
		throw new Error('Not implemented');
	}

	protected transformCode(input: I) {
		const entryPath = phpFilePath(phpEntryFile(this.files));
		return [
			'<?php',
			`require '${entryPath}';`,
			`post_message_to_js(json_encode(${this.caseExecutionCode(input)}));`
		].join('\n');
	}

	protected transformResult(result: string): O {
		return JSON.parse(result);
	}

	private handleResult(result: string) {
		this.result = this.transformResult(result);
	}

	async run(_: Context, input: I): Promise<O> {
		const code = this.transformCode(input);
		const response = await this.php.runStream({ code });
		await Promise.all([
			response.stdout.pipeTo(new WritableStream(this.streams.out)),
			response.stderr.pipeTo(new WritableStream(this.streams.err))
		]);
		const exitCode = await response.exitCode;
		if (exitCode !== 0) {
			throw new Error(`Command failed with exit code ${exitCode}`);
		}
		if (this.result === undefined) {
			throw new Error('No result');
		}
		return this.result;
	}

	[Symbol.dispose]() {
		this.result = undefined;
		this.disposeOnMessage();
	}
}
