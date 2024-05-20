export enum Theme {
  Light = "light",
  Dark = "dark",
}

const NEXT_THEMES: Record<Theme, Theme> = {
  [Theme.Light]: Theme.Dark,
  [Theme.Dark]: Theme.Light,
};

export const DEFAULT_THEME = Theme.Light;
export const THEME_STORAGE_KEY = "theme";

function getCurrentTheme() {
  return (localStorage.getItem(THEME_STORAGE_KEY) ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? Theme.Dark
      : Theme.Light)) as Theme;
}

function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function syncTheme() {
  document.addEventListener("astro:after-swap", () =>
    setTheme(getCurrentTheme())
  );
  setTheme(getCurrentTheme());
}

export function toggleTheme() {
  setTheme(NEXT_THEMES[getCurrentTheme()]);
}
