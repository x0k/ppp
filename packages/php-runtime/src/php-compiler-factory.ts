import {
  PHP,
  loadPHPRuntime,
  type EmscriptenOptions,
} from "@php-wasm/universal";
import type { Context } from "libs/context";

// @ts-expect-error hack
import * as phpModule from "/node_modules/@php-wasm/web-8-5/jspi/php_8_5.js";

export async function phpCompilerFactory(
  ctx: Context,
  instantiateWasm: EmscriptenOptions["instantiateWasm"],
) {
  const phpRuntime = await loadPHPRuntime(phpModule, {
    instantiateWasm,
  });
  const php = new PHP(phpRuntime);
  ctx.onCancel(() => {
    php.exit(1);
  });
  return php;
}
