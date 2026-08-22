import { startTestCompilerActor } from 'libs/testing/actor';
import { createContext } from 'libs/context';

import { CppTestCompilerFactory } from './test-compiler-factory';

export interface CppTestWorkerConfig {
	cppTestCompilerFactory: CppTestCompilerFactory;
}

startTestCompilerActor<CppTestWorkerConfig>(createContext(), (ctx, streams, factory) =>
	factory(ctx, {
		cppTestCompilerFactory: new CppTestCompilerFactory(streams)
	})
);
