import { startTestCompilerActor } from "testing/actor";
import { createContext } from "libs/context";

import { PhpTestCompilerFactory } from "./test-compiler-factory";

export interface PhpTestWorkerConfig {
  phpTestCompilerFactory: PhpTestCompilerFactory;
}

startTestCompilerActor<PhpTestWorkerConfig>(
  createContext(),
  (ctx, streams, factory) =>
    factory(ctx, {
      phpTestCompilerFactory: new PhpTestCompilerFactory(streams),
    })
);
