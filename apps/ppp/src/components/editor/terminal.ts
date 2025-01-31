import { onDestroy } from "svelte";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal, type ITheme } from "@xterm/xterm";
import type { Streams, Writer } from "libs/io";
import { BACKSPACE, makeErrorWriter } from "libs/logger";

export function makeTerminalTheme(): ITheme {
  return {
    background: "oklch(23.1012% 0 0 / 1)",
  };
}

export interface TerminalConfig {
  theme?: ITheme;
}

export function createTerminal({
  theme = makeTerminalTheme(),
}: TerminalConfig = {}) {
  const terminal = new Terminal({
    theme,
    fontFamily: "monospace",
    convertEol: true,
    rows: 1,
  });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  return { terminal, fitAddon };
}

export function createStreams(terminal: Terminal): Streams {
  const out: Writer = {
    write(data) {
      terminal.write(data);
    },
  };
  const handlers = new Set<(data: Uint8Array) => void>();
  function handleData(data: Uint8Array) {
    for (const handler of handlers) {
      handler(data);
    }
  }
  const encoder = new TextEncoder();
  let buffer = new Uint8Array(1024);
  let offset = 0;
  const emptyArray = new Uint8Array();
  const disposable = terminal.onData((data) => {
    if (data === "\r") {
      terminal.write("\r\n");
      handleData(emptyArray);
      return;
    }
    // Backspace
    if (data === "\x7f") {
      terminal.write("\b \b");
      if (offset > 0) {
        offset--;
      }
      handleData(BACKSPACE);
      return;
    }
    terminal.write(data);
    const input = encoder.encode(data);
    if (offset + input.length > buffer.length) {
      const next = new Uint8Array((offset + input.length) * 2);
      next.set(buffer);
      buffer = next;
    }
    buffer.set(input, offset);
    offset += input.length;
    handleData(input);
  });
  onDestroy(() => disposable.dispose());
  return {
    out,
    err: makeErrorWriter(out),
    in: {
      read() {
        const chunk = buffer.subarray(0, offset);
        offset = 0;
        return chunk;
      },
      onData(handler) {
        handlers.add(handler);
        return {
          [Symbol.dispose]() {
            handlers.delete(handler);
          },
        };
      },
    },
  };
}