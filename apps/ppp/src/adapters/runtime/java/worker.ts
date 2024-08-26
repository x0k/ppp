import { startCompilerActor } from "compiler/actor";

import { makeJavaCompiler } from "./compiler-factory";

startCompilerActor(makeJavaCompiler);
