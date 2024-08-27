import { startCompilerActor } from "compiler/actor";

import { makePhpCompiler } from "./compiler-factory";

startCompilerActor(makePhpCompiler);
