import { startCompilerActor } from "compiler/actor";
import { createContext } from 'libs/context';

import { makeGoCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeGoCompiler);
