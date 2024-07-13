import { startTestCompilerActor } from "testing/actor";

import { PhpTestCompilerFactory } from "./test-compiler-factory";

export interface PhpTestWorkerConfig {
  phpTestCompilerFactory: PhpTestCompilerFactory;
}

startTestCompilerActor<PhpTestWorkerConfig>((out, factory) =>
  factory({
    phpTestCompilerFactory: new PhpTestCompilerFactory(out),
  })
);
