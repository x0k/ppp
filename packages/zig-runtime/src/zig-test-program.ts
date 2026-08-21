import type { OpenDirectory, WASI } from '@bjorn3/browser_wasi_shim';
import type { TestProgram } from 'libs/testing';
import { inContext, type Context } from 'libs/context';
import { isErr } from 'libs/result';
import { assertOpenDir, lookupFile } from 'libs/wasi';

export abstract class ZigTestProgram<I, O> implements TestProgram<I, O> {
	protected textEncoder = new TextEncoder();
	protected textDecoder = new TextDecoder();

	constructor(
		protected readonly code: string,
		protected readonly wasi: WASI,
		protected readonly zigModule: WebAssembly.Module,
		protected readonly outputPath: string
	) {}

	async run(ctx: Context, input: I): Promise<O> {
		this.writeCaseExecutionCode(this.generateCaseExecutionCode(input));
		const program = new Uint8Array(await this.compile(ctx));
		await this.execute(ctx, program);
		return this.readResult();
	}

	protected async compile(ctx: Context): Promise<Uint8Array> {
		const instance = await inContext(
			ctx,
			WebAssembly.instantiate(this.zigModule, {
				wasi_snapshot_preview1: this.wasi.wasiImport
			})
		);
		// @ts-expect-error lack of type information
		const exitCode = this.wasi.start(instance);
		if (exitCode !== 0) {
			throw new Error(`Compilation failed with exit code ${exitCode}`);
		}
		return this.getWasmFile().data;
	}

	protected async execute(ctx: Context, program: Uint8Array<ArrayBuffer>): Promise<void> {
		const module = await inContext(ctx, WebAssembly.compile(program));
		const instance = await inContext(
			ctx,
			WebAssembly.instantiate(module, {
				wasi_snapshot_preview1: this.wasi.wasiImport
			})
		);
		// @ts-expect-error lack of type information
		const exitCode = this.wasi.start(instance);
		if (exitCode !== 0) {
			throw new Error(`Code execution failed with exit code ${exitCode}`);
		}
	}

	/**
	 * Should generate code that produces a variable `output_content: []const u8`.
	 * Requires the user code to declare `const std = @import("std");`
	 */
	protected abstract generateOutputContentCode(input: I): string;

	protected generateCaseExecutionCode(input: I): string {
		return `${this.code}

fn writeCaseOutput(io: std.Io) !void {
  ${this.generateOutputContentCode(input)}
  try std.Io.Dir.writeFile(std.Io.Dir.cwd(), io, .{
    .sub_path = "${this.outputPath}",
    .data = output_content
  });
}

export fn _start() void {
  const io = std.Io.Threaded.global_single_threaded.io();
  writeCaseOutput(io) catch |err| {
    std.Io.Dir.writeFile(std.Io.Dir.cwd(), io, .{
      .sub_path = "${this.outputPath}",
      .data = @errorName(err)
    }) catch {};
  };
}
`;
	}

	protected writeCaseExecutionCode(code: string) {
		const file = lookupFile(this.rootDir, 'main.zig');
		if (isErr(file)) {
			throw new Error(`Failed to read main file: ${file.error}`);
		}
		file.value.data = this.textEncoder.encode(code);
	}

	protected get rootDir(): OpenDirectory {
		const dir = this.wasi.fds[3];
		assertOpenDir(dir);
		return dir;
	}

	protected getWasmFile() {
		const file = lookupFile(this.rootDir, 'main.wasm');
		if (isErr(file)) {
			throw new Error(`Failed to read compiled file: ${file.error}`);
		}
		return file.value;
	}

	protected readOutputFile() {
		const file = lookupFile(this.rootDir, this.outputPath);
		if (isErr(file)) {
			throw new Error(`Failed to read output file: ${file.error}`);
		}
		return file.value;
	}

	protected abstract transformResult(data: string): O;

	protected readResult(): O {
		return this.transformResult(this.textDecoder.decode(this.readOutputFile().data));
	}
}
