import { startTestCompilerActor } from "testing/actor";
import { createContext } from "libs/context";

import { RubyTestCompilerFactory } from "./test-compiler-factory";

export interface RubyTestWorkerConfig {
  rubyTestCompilerFactory: RubyTestCompilerFactory;
}

startTestCompilerActor<RubyTestWorkerConfig>(
  createContext(),
  (ctx, out, factory) =>
    factory(ctx, {
      rubyTestCompilerFactory: new RubyTestCompilerFactory(out),
    })
);
