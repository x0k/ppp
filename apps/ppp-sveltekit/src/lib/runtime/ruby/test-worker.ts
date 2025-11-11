import { createContext } from "libs/context";
import { startTestCompilerActor } from "libs/testing/actor";

import { RubyTestCompilerFactory } from "./test-compiler-factory";

export interface RubyTestWorkerConfig {
  rubyTestCompilerFactory: RubyTestCompilerFactory;
}

startTestCompilerActor<RubyTestWorkerConfig>(
  createContext(),
  (ctx, streams, factory) =>
    factory(ctx, {
      rubyTestCompilerFactory: new RubyTestCompilerFactory(streams),
    })
);
