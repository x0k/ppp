import { startTestCompilerActor } from "testing/actor";

import { GleamTestCompilerFactory } from "./test-compiler-factory";

export interface GleamTestWorkerConfig {
  gleamTestCompilerFactory: GleamTestCompilerFactory;
}

startTestCompilerActor<GleamTestWorkerConfig>((out, factory) =>
  factory({
    gleamTestCompilerFactory: new GleamTestCompilerFactory(out),
  })
);
