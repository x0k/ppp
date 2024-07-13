import { startTestCompilerActor } from "testing/actor";
import { PythonTestCompilerFactory } from "./test-compiler-factory";

export interface PythonTestWorkerConfig {
  pythonTestCompilerFactory: PythonTestCompilerFactory;
}

startTestCompilerActor<PythonTestWorkerConfig>((ctx, out, factory) =>
  factory(ctx, {
    pythonTestCompilerFactory: new PythonTestCompilerFactory(out),
  })
);
