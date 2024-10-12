import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

import { viteStaticCopy } from "vite-plugin-static-copy";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

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
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/gleam-runtime/dist/precompiled",
            dest: "_astro",
            rename: "gleam",
          },
          {
            src: "node_modules/dotnet-runtime/dist/compiler",
            dest: "_astro/dotnet",
          },
          {
            src: "node_modules/dotnet-runtime/dist/lib",
            dest: "_astro/dotnet",
          },
        ],
      }),
      crossOriginIsolation(),
    ],
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
