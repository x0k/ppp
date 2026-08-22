import { ConsoleStdout, PreopenDirectory, WASI } from '@bjorn3/browser_wasi_shim';
import type { Inode } from '@bjorn3/browser_wasi_shim';
import type { Streams } from 'libs/io';
import { Stdin } from 'libs/wasi';

const programArgs = ['main.wasm'];
const programEnv: string[] = [];

export function createProgramWASI(streams: Streams, rootContents?: Map<string, Inode>) {
	const descriptors = [
		new Stdin(streams.in.read.bind(streams.in)),
		new ConsoleStdout(streams.out.write.bind(streams.out)),
		new ConsoleStdout(streams.err.write.bind(streams.err)),
		new PreopenDirectory('.', rootContents ?? new Map())
	];
	return new WASI(programArgs, programEnv, descriptors, { debug: false });
}
