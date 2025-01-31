import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

import { viteStaticCopy } from "vite-plugin-static-copy";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import paraglide from "@inlang/paraglide-astro";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://x0k.github.io",
  base: "/ppp",
  integrations: [
    icon(),
    mdx(),
    svelte(),
    paraglide({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      // define your strategy
			strategy: ["pathname", "baseLocale"]
    }),
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
