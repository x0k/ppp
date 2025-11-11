import { util } from "java-runtime";
import { startTestCompilerActor } from "libs/testing/actor";
import { createContext } from "libs/context";

import { JavaTestCompilerFactory } from "./test-compiler-factory";

export interface JavaTestWorkerConfig {
  javaTestCompilerFactory: JavaTestCompilerFactory;
  util: typeof util;
}

startTestCompilerActor<JavaTestWorkerConfig>(
  createContext(),
  (ctx, streams, factory) =>
    factory(ctx, {
      javaTestCompilerFactory: new JavaTestCompilerFactory(streams),
      util,
    })
);
