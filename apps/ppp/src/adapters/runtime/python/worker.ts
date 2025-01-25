import { startCompilerActor } from "compiler/actor";
import { createContext } from 'libs/context';

import { makePythonCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makePythonCompiler);
