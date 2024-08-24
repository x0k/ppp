import { FitAddon } from '@xterm/addon-fit';
import { Terminal, type ITheme } from "@xterm/xterm";
import type { Theme } from "daisyui";
import themes from "daisyui/src/theming/themes";

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
