import { startCompilerActor } from "compiler/actor";

import { makeGoCompiler } from "./compiler-factory";

startCompilerActor(makeGoCompiler);
