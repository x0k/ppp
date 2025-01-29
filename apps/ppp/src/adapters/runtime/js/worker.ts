import { createContext } from 'libs/context';
import { startCompilerActor } from "compiler/actor";

import { makeJsCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeJsCompiler);
