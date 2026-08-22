import { LuaFactory } from 'wasmoon';
import type { LuaEngine } from 'wasmoon';

import { inContext, type Context } from 'libs/context';
import type { Streams } from 'libs/io';

class LuaStdin {
	private buffer = '';
	private eof = false;

	constructor(private readonly read: () => Uint8Array) {}

	private fill(): boolean {
		if (this.eof) {
			return false;
		}
		const chunk = this.read();
		if (!chunk || chunk.length === 0) {
			this.eof = true;
			return false;
		}
		this.buffer += new TextDecoder().decode(chunk);
		return true;
	}

	readLine(includeNewline: boolean): string | null {
		for (;;) {
			const index = this.buffer.indexOf('\n');
			if (index !== -1) {
				const line = this.buffer.slice(0, index + (includeNewline ? 1 : 0));
				this.buffer = this.buffer.slice(index + 1);
				return line;
			}
			if (!this.fill()) {
				break;
			}
		}
		if (this.buffer.length > 0) {
			const rest = this.buffer;
			this.buffer = '';
			return rest;
		}
		return null;
	}

	readAll(): string {
		while (this.fill()) {
			// Drain until EOF.
		}
		const all = this.buffer;
		this.buffer = '';
		return all;
	}

	readNumber(): number | null {
		for (;;) {
			const line = this.readLine(false);
			if (line === null) {
				return null;
			}
			const trimmed = line.trim();
			if (trimmed === '') {
				continue;
			}
			const n = Number(trimmed);
			return Number.isNaN(n) ? null : n;
		}
	}
}

// Redirects io.write to JS and wires io.read onto the injected readers.
const STDIO_PREAMBLE = `
local __write_raw = __write_raw
function io.write(...)
	local parts = {}
	for i = 1, select('#', ...) do
		parts[i] = tostring(select(i, ...))
	end
	__write_raw(table.concat(parts))
	return io
end

local __read_line = __read_line
local __read_all = __read_all
local __read_number = __read_number
function io.read(format)
	format = format == nil and 'l' or format
	if format == 'a' then
		return __read_all()
	elseif format == 'n' then
		return __read_number()
	end
	local line = __read_line(format == 'L')
	if line == nil then
		return nil
	end
	return line
end
`;

export interface LuaRuntime {
	factory: LuaFactory;
	engine: LuaEngine;
}

export const luaRuntimeFactory = async (
	ctx: Context,
	streams: Streams,
	wasmUri: string
): Promise<LuaRuntime> => {
	const factory = new LuaFactory(wasmUri);
	const engine = await inContext(ctx, factory.createEngine());

	const encoder = new TextEncoder();
	engine.global.set('print', (...args: unknown[]) => {
		streams.out.write(encoder.encode(args.map((arg) => String(arg)).join('\t') + '\n'));
	});
	engine.global.set('__write_raw', (text: string) => {
		streams.out.write(encoder.encode(text));
	});
	const stdin = new LuaStdin(streams.in.read.bind(streams.in));
	engine.global.set('__read_line', (includeNewline: boolean) => stdin.readLine(includeNewline));
	engine.global.set('__read_all', () => stdin.readAll());
	engine.global.set('__read_number', () => stdin.readNumber());

	await engine.doString(STDIO_PREAMBLE);
	return { factory, engine };
};

export type { LuaEngine, LuaFactory };
