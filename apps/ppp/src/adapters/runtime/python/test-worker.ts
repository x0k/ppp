import { startTestCompilerActor } from "testing/actor";
import { PythonTestCompilerFactory } from "./test-compiler-factory";

export interface PythonTestWorkerConfig {
  pythonTestCompilerFactory: PythonTestCompilerFactory;
}

startTestCompilerActor<PythonTestWorkerConfig>((out, factory) =>
  factory({
    pythonTestCompilerFactory: new PythonTestCompilerFactory(out),
  })
);
