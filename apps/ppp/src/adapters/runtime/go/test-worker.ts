import { startTestCompilerActor } from "testing/actor";

import { GoTestCompilerFactory } from "./test-compiler-factory";

export interface GoTestWorkerConfig {
  goTestCompilerFactory: GoTestCompilerFactory;
}

startTestCompilerActor<GoTestWorkerConfig>((out, factory) =>
  factory({
    goTestCompilerFactory: new GoTestCompilerFactory(out),
  })
);
