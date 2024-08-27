import { startCompilerActor } from "compiler/actor";

import { makeRustCompiler } from "./compiler-factory";

startCompilerActor(makeRustCompiler);
