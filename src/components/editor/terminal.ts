import type { ITheme } from "@xterm/xterm";
import type { Theme } from "daisyui";
import themes from "daisyui/src/theming/themes";

export function makeTheme(themeName: Theme): ITheme {
  const theme = themes[themeName];
  console.log(theme);
  return {
    background: "oklch(23.1012% 0 0 / 1)",
  };
}
