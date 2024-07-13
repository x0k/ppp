import { startTestCompilerActor } from "testing/actor";

import { GleamTestCompilerFactory } from "./test-compiler-factory";

export interface GleamTestWorkerConfig {
  gleamTestCompilerFactory: GleamTestCompilerFactory;
}

startTestCompilerActor<GleamTestWorkerConfig>((ctx, out, factory) =>
  factory(ctx, {
    gleamTestCompilerFactory: new GleamTestCompilerFactory(out),
  })
);
