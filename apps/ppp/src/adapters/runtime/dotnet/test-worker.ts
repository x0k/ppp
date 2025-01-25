import { startTestCompilerActor } from "testing/actor";
import { makeExecutionCode } from "dotnet-runtime";
import { createContext } from "libs/context";

import { DotnetTestCompilerFactory } from "./test-compiler-factory";

export interface DotnetTestWorkerConfig {
  dotnetTestCompilerFactory: DotnetTestCompilerFactory;
  makeExecutionCode: typeof makeExecutionCode;
}

startTestCompilerActor<DotnetTestWorkerConfig>(
  createContext(),
  (ctx, out, factory) =>
    factory(ctx, {
      dotnetTestCompilerFactory: new DotnetTestCompilerFactory(out),
      makeExecutionCode,
    })
);
