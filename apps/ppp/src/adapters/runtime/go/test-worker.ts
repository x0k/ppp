import { startTestCompilerActor } from "testing/actor";
import { createContext } from "libs/context";

import { GoTestCompilerFactory } from "./test-compiler-factory";

export interface GoTestWorkerConfig {
  goTestCompilerFactory: GoTestCompilerFactory;
}

startTestCompilerActor<GoTestWorkerConfig>(
  createContext(),
  (ctx, out, factory) =>
    factory(ctx, {
      goTestCompilerFactory: new GoTestCompilerFactory(out),
    })
);
