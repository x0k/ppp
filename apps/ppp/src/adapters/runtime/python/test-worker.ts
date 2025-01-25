import { startTestCompilerActor } from "testing/actor";
import { createContext } from "libs/context";

import { PythonTestCompilerFactory } from "./test-compiler-factory";

export interface PythonTestWorkerConfig {
  pythonTestCompilerFactory: PythonTestCompilerFactory;
}

startTestCompilerActor<PythonTestWorkerConfig>(
  createContext(),
  (ctx, out, factory) =>
    factory(ctx, {
      pythonTestCompilerFactory: new PythonTestCompilerFactory(out),
    })
);
