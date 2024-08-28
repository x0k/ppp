import { startCompilerActor } from "compiler/actor";

import { makeRubyCompiler } from "./compiler-factory";

startCompilerActor(makeRubyCompiler);
