import { WebPHP } from "@php-wasm/web";
// @ts-expect-error hack
import * as phpModule from "@php-wasm/web/light/php_8_3.js";

import { version } from "./version";

export const phpRuntimeFactory = () =>
  WebPHP.loadRuntime(version, {
    onPhpLoaderModuleLoaded(loader) {
      Object.assign(loader, phpModule)
    },
  });
