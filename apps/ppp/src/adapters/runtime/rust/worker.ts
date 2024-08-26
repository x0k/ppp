import { startCompilerActor } from "compiler/actor";

import { RustCompilerFactory } from "./compiler-factory";

startCompilerActor(RustCompilerFactory);
