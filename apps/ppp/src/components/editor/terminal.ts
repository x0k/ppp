import { FitAddon } from "@xterm/addon-fit";
import { Terminal, type ITheme } from "@xterm/xterm";
import type { Theme } from "daisyui";
import themes from "daisyui/src/theming/themes";
import type { Streams, Writer } from "libs/io";
import { makeErrorWriter } from "libs/logger";

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
  let input = "";
  const disposable = terminal.onData((data) => {
    terminal.write(data);
    input += data;
  });
  const encoder = new TextEncoder();
  const streams: Streams & Disposable = {
    out,
    err: makeErrorWriter(out),
    in: {
      read() {
        const bytes = encoder.encode(input);
        input = "";
        return bytes;
      },
    },
    [Symbol.dispose]() {
      disposable.dispose();
    },
  };
  return { terminal, fitAddon, streams };
}
