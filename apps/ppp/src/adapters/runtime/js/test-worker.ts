import { startTestCompilerActor } from "testing/actor";

import { JsTestCompilerFactory } from "./test-compiler-factory";
import { createContext } from "libs/context";

export interface JsTestWorkerConfig {
  jsTestCompilerFactory: JsTestCompilerFactory;
}

startTestCompilerActor<JsTestWorkerConfig>(
  createContext(),
  (ctx, out, factory) =>
    factory(ctx, {
      jsTestCompilerFactory: new JsTestCompilerFactory(out),
    })
);
