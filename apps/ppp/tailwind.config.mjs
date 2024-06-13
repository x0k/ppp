import Color from "color";
import themes from "daisyui/src/theming/themes";

const alpha = (clr, val) => Color(clr).alpha(val).rgb().string();
const lighten = (clr, val) => Color(clr).lighten(val).rgb().string();
const darken = (clr, val) => Color(clr).darken(val).rgb().string();

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    darkTheme: "business",
    themes: [
      {
        business: {
          ...themes["business"],
          "base-100": lighten(themes["business"]["base-100"], 0.2),
        },
      },
      "light",
    ],
  },
  darkMode: ["selector", '[data-theme="business"]'],
};
