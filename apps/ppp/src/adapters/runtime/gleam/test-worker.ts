import { startTestCompilerActor } from "testing/actor";
import { createContext } from "libs/context";

import { GleamTestCompilerFactory } from "./test-compiler-factory";

export interface GleamTestWorkerConfig {
  gleamTestCompilerFactory: GleamTestCompilerFactory;
}

startTestCompilerActor<GleamTestWorkerConfig>(
  createContext(),
  (ctx, out, factory) =>
    factory(ctx, {
      gleamTestCompilerFactory: new GleamTestCompilerFactory(out),
    })
);
