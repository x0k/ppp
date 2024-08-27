import { startCompilerActor } from "compiler/actor";

import { makeDotnetCompiler } from "./compiler-factory";

startCompilerActor(makeDotnetCompiler);
