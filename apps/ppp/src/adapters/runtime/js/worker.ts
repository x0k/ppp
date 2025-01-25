import { startCompilerActor } from "compiler/actor";
import { createContext } from 'libs/context';

import { makeJsCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeJsCompiler);
