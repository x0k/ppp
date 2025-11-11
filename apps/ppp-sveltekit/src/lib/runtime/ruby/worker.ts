import { startCompilerActor } from "libs/compiler/actor";
import { createContext } from 'libs/context';

import { makeRubyCompiler } from "./compiler-factory";

startCompilerActor(createContext(), makeRubyCompiler);
