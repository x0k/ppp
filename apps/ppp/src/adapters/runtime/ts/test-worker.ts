import { createContext } from "libs/context";
import { startTestCompilerActor } from "testing/actor";

import { TsTestCompilerFactory } from "./test-compiler-factory";

export interface TsTestWorkerConfig {
  tsTestCompilerFactory: TsTestCompilerFactory;
}

startTestCompilerActor<TsTestWorkerConfig>(
  createContext(),
  (ctx, out, factory) =>
    factory(ctx, {
      tsTestCompilerFactory: new TsTestCompilerFactory(out),
    })
);
