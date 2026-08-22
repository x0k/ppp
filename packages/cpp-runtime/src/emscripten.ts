// Types for the Emscripten ES6 toolchain modules vendored from browsercc
// (https://github.com/BertalanD/browsercc, MIT).
export interface EmscriptenFS {
	mkdirTree(path: string): void;
	writeFile(path: string, data: string | Uint8Array): void;
	readFile(path: string, opts: { encoding: 'binary' }): Uint8Array;
}

export interface EmscriptenModule {
	FS: EmscriptenFS;
	callMain(args: string[]): number;
}

export interface EmscriptenOptions {
	wasmBinary?: ArrayBuffer;
	thisProgram?: string;
	printErr?: (text: string) => void;
	print?: (text: string) => void;
}

export type EmscriptenFactory = (opts?: EmscriptenOptions) => Promise<EmscriptenModule>;
