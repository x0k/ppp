import { createContext } from "libs/context";
import { startTestCompilerActor } from "libs/testing/actor";

import { JsTestCompilerFactory } from "./test-compiler-factory";

export interface JsTestWorkerConfig {
  jsTestCompilerFactory: JsTestCompilerFactory;
}

startTestCompilerActor<JsTestWorkerConfig>(
  createContext(),
  (ctx, streams, factory) =>
    factory(ctx, {
      jsTestCompilerFactory: new JsTestCompilerFactory(streams),
    })
);
