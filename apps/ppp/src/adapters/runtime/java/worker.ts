import { startCompilerActor } from "libs/compiler/actor";
import { createContext } from 'libs/context';

import { makeJavaCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeJavaCompiler);
