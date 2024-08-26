import { startCompilerActor } from "compiler/actor";

import { makeTsCompiler } from "./compiler-factory";

startCompilerActor(makeTsCompiler);
