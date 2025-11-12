import { startTestCompilerActor } from "libs/testing/actor";
import { makeExecutionCode } from "dotnet-runtime";
import { createContext } from "libs/context";

import { DotnetTestCompilerFactory } from "./test-compiler-factory";

export interface DotnetTestWorkerConfig {
  dotnetTestCompilerFactory: DotnetTestCompilerFactory;
  makeExecutionCode: typeof makeExecutionCode;
}

startTestCompilerActor<DotnetTestWorkerConfig>(
  createContext(),
  (ctx, streams, factory) =>
    factory(ctx, {
      dotnetTestCompilerFactory: new DotnetTestCompilerFactory(streams),
      makeExecutionCode,
    })
);
