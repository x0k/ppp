import { FitAddon } from '@xterm/addon-fit';
import { Terminal, type IDisposable, type ITheme } from '@xterm/xterm';

export function makeTerminalTheme(): ITheme {
	return {
		background: 'oklch(22.648% 0 0)'
	};
}

export interface TerminalConfig {
	theme?: ITheme;
}

export enum InputMode {
	Line = 'line',
	Raw = 'raw'
}

export const INPUT_MODS = Object.values(InputMode)

export function createTerminal({ theme = makeTerminalTheme() }: TerminalConfig = {}) {
	const terminal = new Terminal({
		theme,
		fontFamily: 'monospace',
		convertEol: true,
		rows: 1
	});
	const fitAddon = new FitAddon();
	terminal.loadAddon(fitAddon);
	return { terminal, fitAddon };
}

export function createReadableStream(terminal: Terminal) {
	let disposable: IDisposable;
	return new ReadableStream<string>({
		start(controller) {
			disposable = terminal.onData((data) => {
				controller.enqueue(data);
			});
		},
		cancel() {
			console.log("CANCEL")
			disposable.dispose();
		}
	});
}

const EMPTY_UINT8_ARRAY = new Uint8Array();
const TEXT_ENCODER = new TextEncoder();

export function createRawInputMode(terminal: Terminal) {
	return new TransformStream<string, Uint8Array>({
		transform(chunk, controller) {
			if (chunk === '\x04') {
				terminal.write('<EOF>');
				controller.enqueue(EMPTY_UINT8_ARRAY);
				return;
			}
			terminal.write(chunk);
			controller.enqueue(TEXT_ENCODER.encode(chunk));
		}
	});
}

export function createLineInputMode(terminal: Terminal) {
	const buffer: string[] = [];
	function flush(controller: TransformStreamDefaultController<Uint8Array>) {
		if (buffer.length > 0) {
			controller.enqueue(TEXT_ENCODER.encode(buffer.join('')));
			buffer.length = 0;
		}
	}
	return new TransformStream<string, Uint8Array>({
		transform(chunk, controller) {
			if (chunk === '\r') {
				terminal.write('\r\n');
				flush(controller);
				// EOF
				controller.enqueue(EMPTY_UINT8_ARRAY);
				return;
			}
			// Backspace
			if (chunk === '\x7f') {
				if (buffer.pop() !== undefined) {
					terminal.write('\b \b');
				}
				return;
			}
			terminal.write(chunk);
			buffer.push(chunk);
		},
		flush
	});
}
