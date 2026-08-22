import { startCompilerActor } from 'libs/compiler/actor';
import { createContext } from 'libs/context';

import { makeLuaCompiler } from './compiler-factory';

startCompilerActor(createContext(), makeLuaCompiler);
