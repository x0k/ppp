import { startCompilerActor } from "compiler/actor";
import { createContext } from 'libs/context';

import { makePhpCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makePhpCompiler);
