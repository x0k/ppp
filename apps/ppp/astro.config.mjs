// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

import { viteStaticCopy } from "vite-plugin-static-copy";
// @ts-expect-error
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";

const base = "ppp";

// https://astro.build/config
export default defineConfig({
  site: "https://x0k.github.io",
  base: `/${base}`,
  integrations: [
    icon(),
    mdx(),
    svelte(),
  ],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    worker: {
      format: "es",
    },
    esbuild: {
      target: "es2022",
    },
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
    },
    assetsInclude: ["**/*.wasm", "**/*.zip", "**/*.rlib", "**/*.so"],
    plugins: [
      paraglideVitePlugin({
        project: "./project.inlang",
        outdir: "./src/paraglide",
        strategy: ["url", "baseLocale"],
        urlPatterns: [
          {
            pattern:
              `:protocol://:domain(.*)::port?/:base(${base})?/:locale(en|ru)?/:path(.*)`,
            deLocalizedNamedGroups: { base, locale: null },
            localizedNamedGroups: {
              en: { base, locale: null },
              ru: { base, locale: "ru" },
            },
          },
        ],
      }),
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
      tailwindcss(),
    ],
  },
  markdown: {
    shikiConfig: {
      wrap: true,
      theme: "dracula",
    },
  },
});
