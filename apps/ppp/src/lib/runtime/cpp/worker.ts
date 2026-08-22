import { startCompilerActor } from 'libs/compiler/actor';
import { createContext } from 'libs/context';

import { makeCppCompiler } from './compiler-factory';

startCompilerActor(createContext(), makeCppCompiler);
