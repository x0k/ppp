import { startCompilerActor } from "compiler/actor";

import { makeJsCompiler } from "./compiler-factory";

startCompilerActor(makeJsCompiler);
