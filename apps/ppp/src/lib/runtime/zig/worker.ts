import { startCompilerActor } from 'libs/compiler/actor';
import { createContext } from 'libs/context';

import { makeZigCompiler } from './compiler-factory';

startCompilerActor(createContext(), makeZigCompiler);
