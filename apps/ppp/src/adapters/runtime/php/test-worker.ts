import { startTestCompilerActor } from "testing/actor";
import { createContext } from "libs/context";

import { PhpTestCompilerFactory } from "./test-compiler-factory";

export interface PhpTestWorkerConfig {
  phpTestCompilerFactory: PhpTestCompilerFactory;
}

startTestCompilerActor<PhpTestWorkerConfig>(
  createContext(),
  (ctx, out, factory) =>
    factory(ctx, {
      phpTestCompilerFactory: new PhpTestCompilerFactory(out),
    })
);
