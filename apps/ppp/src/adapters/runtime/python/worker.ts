import { startCompilerActor } from "compiler/actor";

import { makePythonCompiler } from "./compiler-factory";

startCompilerActor(makePythonCompiler);
