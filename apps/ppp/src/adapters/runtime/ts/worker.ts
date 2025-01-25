import { startCompilerActor } from "compiler/actor";
import { createContext } from 'libs/context';

import { makeTsCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeTsCompiler);
