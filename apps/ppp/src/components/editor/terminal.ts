import { FitAddon } from "@xterm/addon-fit";
import { Terminal, type ITheme } from "@xterm/xterm";
import type { Theme } from "daisyui";
import themes from "daisyui/src/theming/themes";
import type { Writer } from "libs/io";
import { ok } from "libs/result";

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
  return { terminal, fitAddon };
}

export function createTerminalWriter(terminal: Terminal): Writer {
  return {
    write(data) {
      terminal.write(data);
      return ok(data.length);
    },
  };
}
