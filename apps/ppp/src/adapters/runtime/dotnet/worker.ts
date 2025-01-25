import { startCompilerActor } from "compiler/actor";
import { createContext } from 'libs/context';

import { makeDotnetCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeDotnetCompiler);
