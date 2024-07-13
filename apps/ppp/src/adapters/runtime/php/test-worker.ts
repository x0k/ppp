import { startTestCompilerActor } from "testing/actor";

import { PhpTestCompilerFactory } from "./test-compiler-factory";

export interface PhpTestWorkerConfig {
  phpTestCompilerFactory: PhpTestCompilerFactory;
}

startTestCompilerActor<PhpTestWorkerConfig>((ctx, out, factory) =>
  factory(ctx, {
    phpTestCompilerFactory: new PhpTestCompilerFactory(out),
  })
);
