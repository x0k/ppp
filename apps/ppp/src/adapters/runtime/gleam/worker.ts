import { startCompilerActor } from "compiler/actor";

import { makeGleamCompiler } from "./compiler-factory";

startCompilerActor(makeGleamCompiler);
