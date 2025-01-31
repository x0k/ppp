import { startCompilerActor } from "libs/compiler/actor";
import { createContext } from 'libs/context';

import { makeGleamCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeGleamCompiler);
