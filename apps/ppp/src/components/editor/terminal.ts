import { onDestroy } from "svelte";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal, type ITheme } from "@xterm/xterm";
import type { Theme } from "daisyui";
import themes from "daisyui/src/theming/themes";
import type { Streams, Writer } from "libs/io";
import { makeErrorWriter } from "libs/logger";
import { EOF_SEQUENCE } from "libs/sync";

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
  let eof = false;
  const disposable = terminal.onData((data) => {
    if (data === "\x04") {
      eof = true;
      terminal.write("<EOF>");
      return;
    }
    terminal.write(data);
    if (eof) {
      return;
    }
    input += data;
  });
  onDestroy(() => disposable.dispose());
  const encoder = new TextEncoder();
  const streams: Streams = {
    out,
    err: makeErrorWriter(out),
    in: {
      read() {
        if (eof && input === "") {
          eof = false;
          return EOF_SEQUENCE;
        }
        const bytes = encoder.encode(input);
        input = "";
        return bytes;
      },
    },
  };
  return { terminal, fitAddon, streams };
}
