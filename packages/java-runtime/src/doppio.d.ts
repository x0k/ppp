import type * as doppio from "./vendor/typings/src/doppiojvm.d.ts";

declare global {
  var Doppio: typeof doppio;
}
