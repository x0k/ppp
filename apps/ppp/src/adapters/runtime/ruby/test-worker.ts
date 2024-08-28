import { startTestCompilerActor } from "testing/actor";

import { RubyTestCompilerFactory } from "./test-compiler-factory";

export interface RubyTestWorkerConfig {
  rubyTestCompilerFactory: RubyTestCompilerFactory;
}

startTestCompilerActor<RubyTestWorkerConfig>((ctx, out, factory) =>
  factory(ctx, {
    rubyTestCompilerFactory: new RubyTestCompilerFactory(out),
  })
);
