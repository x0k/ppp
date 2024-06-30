import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

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
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    worker: {
      format: "es",
    },
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
    },
    assetsInclude: ["**/*.wasm", "**/*.zip", "**/*.rlib", "**/*.so"],
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
