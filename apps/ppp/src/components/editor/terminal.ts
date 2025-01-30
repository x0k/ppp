import { onDestroy } from "svelte";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal, type ITheme } from "@xterm/xterm";
import type { Theme } from "daisyui";
import themes from "daisyui/src/theming/themes";
import type { Streams, Writer } from "libs/io";
import { BACKSPACE, makeErrorWriter } from "libs/logger";

function makeTerminalTheme(themeName: Theme): ITheme {
  const theme = themes[themeName];
  return {
    background: "oklch(23.1012% 0 0 / 1)",
  };
}

export function createTerminal() {
  const terminal = new Terminal({
    theme: makeTerminalTheme("business"),
    fontFamily: "monospace",
    convertEol: true,
    rows: 1,
  });
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
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
  const emptyArray = new Uint8Array()
  const disposable = terminal.onData((data) => {
    let input: Uint8Array;
    if (data === "\r") {
      terminal.write("\r\n");
      handleData(emptyArray);
      return;
    }
    if (data === '\x7f') { // Backspace
      terminal.write('\b \b')
      if (offset > 0) {
        offset--
      }
      handleData(BACKSPACE)
      return
    }
    terminal.write(data);
    input = encoder.encode(data);
    if (offset + input.length > buffer.length) {
      const next = new Uint8Array((offset + input.length) * 2);
      next.set(buffer);
      buffer = next;
    }
    buffer.set(input, offset);
    offset += input.length;
    handleData(input)
  });
  onDestroy(() => disposable.dispose());
  const streams: Streams = {
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
  return { terminal, fitAddon, streams };
}
