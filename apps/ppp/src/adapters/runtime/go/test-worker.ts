import { startTestCompilerActor } from "testing/actor";

import { GoTestCompilerFactory } from "./test-compiler-factory";

export interface GoTestWorkerConfig {
  goTestCompilerFactory: GoTestCompilerFactory;
}

startTestCompilerActor<GoTestWorkerConfig>((ctx, out, factory) =>
  factory(ctx, {
    goTestCompilerFactory: new GoTestCompilerFactory(out),
  })
);
