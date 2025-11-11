import { createContext } from 'libs/context';
import { startCompilerActor } from "libs/compiler/actor";

import { makeJsCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeJsCompiler);
