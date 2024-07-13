import { startTestCompilerActor } from "testing/actor";
import { makeExecutionCode } from "dotnet-runtime";

import { DotnetTestCompilerFactory } from "./test-compiler-factory";

export interface DotnetTestWorkerConfig {
  dotnetTestCompilerFactory: DotnetTestCompilerFactory;
  makeExecutionCode: typeof makeExecutionCode;
}

startTestCompilerActor<DotnetTestWorkerConfig>((ctx, out, factory) =>
  factory(ctx, {
    dotnetTestCompilerFactory: new DotnetTestCompilerFactory(out),
    makeExecutionCode,
  })
);
