import { defineConfig } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { createLogger } from "vite";

import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

const logger = createLogger();
const loggerWarn = logger.warn;

logger.warn = (msg, options) => {
  // Ignore warnings from pyodide distribution
  if (msg.includes("/public/pyodide/")) return;
  loggerWarn(msg, options);
};

// https://astro.build/config
export default defineConfig({
  site: "https://x0k.github.io",
  base: "/ppp",
  integrations: [tailwind(), icon(), mdx(), svelte()],
  vite: {
    customLogger: logger,
    optimizeDeps: {
      exclude: ["pyodide"],
    },
    assetsInclude: ["**/*.wasm"],
    build: {
      rollupOptions: {
        external: ["sharp"],
        output: {
          assetFileNames: "assets/[name].[hash].[ext]",
        },
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/pyodide/*.*",
            dest: "./assets/pyodide",
          },
        ],
      }),
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
