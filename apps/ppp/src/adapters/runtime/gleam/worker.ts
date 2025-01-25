import { startCompilerActor } from "compiler/actor";
import { createContext } from 'libs/context';

import { makeGleamCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeGleamCompiler);
