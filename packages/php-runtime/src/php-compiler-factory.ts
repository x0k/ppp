import { loadPHPRuntime, PHP } from '@php-wasm/universal'
// @ts-expect-error hack
import * as phpModule from "@php-wasm/web/light/php_8_3.js";
import type { Context } from 'libs/context';

export async function phpCompilerFactory (ctx: Context) {
  const phpRuntime = await loadPHPRuntime(phpModule)
  const php = new PHP(phpRuntime)
  ctx.onCancel(() => {
    php.exit(1)
  })
  return php
}
