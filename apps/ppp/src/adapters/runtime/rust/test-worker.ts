import { startTestCompilerActor } from "testing/actor";

import { RustTestCompilerFactory } from "./test-compiler-factory";

export interface RustTestWorkerConfig {
  rustTestCompilerFactory: RustTestCompilerFactory;
}

startTestCompilerActor<RustTestWorkerConfig>((ctx, out, factory) =>
  factory(ctx, {
    rustTestCompilerFactory: new RustTestCompilerFactory(out),
  })
);
