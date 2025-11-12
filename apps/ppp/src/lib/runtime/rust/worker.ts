import { startCompilerActor } from "libs/compiler/actor";
import { createContext } from 'libs/context';

import { makeRustCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeRustCompiler);
