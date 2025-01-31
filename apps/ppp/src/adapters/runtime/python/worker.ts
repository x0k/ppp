import { startCompilerActor } from "libs/compiler/actor";
import { createContext } from 'libs/context';

import { makePythonCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makePythonCompiler);
