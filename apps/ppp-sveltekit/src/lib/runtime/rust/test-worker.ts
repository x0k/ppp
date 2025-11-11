import { startTestCompilerActor } from "libs/testing/actor";
import { createContext } from 'libs/context';

import { RustTestCompilerFactory } from "./test-compiler-factory";

export interface RustTestWorkerConfig {
  rustTestCompilerFactory: RustTestCompilerFactory;
}

startTestCompilerActor<RustTestWorkerConfig>(createContext(), (ctx, out, factory) =>
  factory(ctx, {
    rustTestCompilerFactory: new RustTestCompilerFactory(out),
  })
);
