import { startTestCompilerActor } from "libs/testing/actor";
import { createContext } from "libs/context";

import { GleamTestCompilerFactory } from "./test-compiler-factory";

export interface GleamTestWorkerConfig {
  gleamTestCompilerFactory: GleamTestCompilerFactory;
}

startTestCompilerActor<GleamTestWorkerConfig>(
  createContext(),
  (ctx, streams, factory) =>
    factory(ctx, {
      gleamTestCompilerFactory: new GleamTestCompilerFactory(streams),
    })
);
