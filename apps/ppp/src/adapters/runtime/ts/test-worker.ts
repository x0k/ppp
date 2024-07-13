import { startTestCompilerActor } from "testing/actor";
import { TsTestCompilerFactory } from "./test-compiler-factory";

export interface TsTestWorkerConfig {
  tsTestCompilerFactory: TsTestCompilerFactory;
}

startTestCompilerActor<TsTestWorkerConfig>((out, factory) =>
  factory({
    tsTestCompilerFactory: new TsTestCompilerFactory(out),
  })
);
