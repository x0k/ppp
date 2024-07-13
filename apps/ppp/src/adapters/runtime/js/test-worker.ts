import { startTestCompilerActor } from "testing/actor";

import { JsTestCompilerFactory } from "./test-compiler-factory";

export interface JsTestWorkerConfig {
  jsTestCompilerFactory: JsTestCompilerFactory;
}

startTestCompilerActor<JsTestWorkerConfig>((ctx, out, factory) =>
  factory(ctx, {
    jsTestCompilerFactory: new JsTestCompilerFactory(out),
  })
);
