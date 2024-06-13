import { defineConfig } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { createLogger } from "vite";
import { fileURLToPath } from "node:url";

import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

const logger = createLogger();
const loggerWarn = logger.warn;

logger.warn = (msg, options) => {
  // Ignore warnings from pyodide distribution
  if (msg.includes("pyodide/pyodide")) return;
  loggerWarn(msg, options);
};

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
      rollupOptions: {
        output: {
          assetFileNames: "assets/[name].[hash].[ext]",
        },
      },
      plugins: [
        {
          name: "ignore-wasm-imports",
          load(id) {
            if (id?.endsWith(".wasm")) {
              return {
                code: "export default {}",
                map: null,
              };
            }
          },
        },
      ],
    },
    customLogger: logger,
    optimizeDeps: {
      exclude: ["pyodide", "@php-wasm/web"],
    },
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
    },
    assetsInclude: ["**/php_8_3.wasm"],
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
