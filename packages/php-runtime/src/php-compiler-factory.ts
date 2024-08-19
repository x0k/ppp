import { loadPHPRuntime, PHP } from '@php-wasm/universal'
// @ts-expect-error hack
import * as phpModule from "@php-wasm/web/light/php_8_3.js";

export async function phpCompilerFactory () {
  const phpRuntime = await loadPHPRuntime(phpModule)
  return new PHP(phpRuntime)
}
