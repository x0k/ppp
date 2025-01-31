import { startCompilerActor } from "libs/compiler/actor";
import { createContext } from 'libs/context';

import { makePhpCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makePhpCompiler);
