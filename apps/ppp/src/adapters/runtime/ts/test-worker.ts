import { createContext } from "libs/context";
import { startTestCompilerActor } from "testing/actor";

import { TsTestCompilerFactory } from "./test-compiler-factory";

export interface TsTestWorkerConfig {
  tsTestCompilerFactory: TsTestCompilerFactory;
}

startTestCompilerActor<TsTestWorkerConfig>(
  createContext(),
  (ctx, streams, factory) =>
    factory(ctx, {
      tsTestCompilerFactory: new TsTestCompilerFactory(streams),
    })
);
