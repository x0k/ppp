import { startTestCompilerActor } from "testing/actor";

import { JsTestCompilerFactory } from "./test-compiler-factory";

export interface JsTestWorkerConfig {
  jsTestCompilerFactory: JsTestCompilerFactory;
}

startTestCompilerActor<JsTestWorkerConfig>((out, factory) =>
  factory({
    jsTestCompilerFactory: new JsTestCompilerFactory(out),
  })
);
