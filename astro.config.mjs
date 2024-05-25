import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://x0k.github.io",
  base: "/ppp",
  integrations: [tailwind(), icon(), mdx(), svelte()],
  vite: {
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
    },
  },
  markdown: {
    shikiConfig: {
      wrap: true,
      theme: "dracula",
    },
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ru"],
    fallback: {
      ru: "en",
    },
  },
});
