import { startTestCompilerActor } from 'libs/testing/actor';
import { createContext } from 'libs/context';

import { LuaTestCompilerFactory } from './test-compiler-factory';

export interface LuaTestWorkerConfig {
	luaTestCompilerFactory: LuaTestCompilerFactory;
}

startTestCompilerActor<LuaTestWorkerConfig>(createContext(), (ctx, streams, factory) =>
	factory(ctx, {
		luaTestCompilerFactory: new LuaTestCompilerFactory(streams)
	})
);
