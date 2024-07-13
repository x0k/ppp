import { startTestCompilerActor } from "testing/actor";

import { RustTestCompilerFactory } from "./test-compiler-factory";

export interface RustTestWorkerConfig {
  rustTestCompilerFactory: RustTestCompilerFactory;
}

startTestCompilerActor<RustTestWorkerConfig>((out, factory) =>
  factory({
    rustTestCompilerFactory: new RustTestCompilerFactory(out),
  })
);
