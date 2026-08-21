import { startTestCompilerActor } from 'libs/testing/actor';
import { createContext } from 'libs/context';

import { ZigTestCompilerFactory } from './test-compiler-factory';

export interface ZigTestWorkerConfig {
	zigTestCompilerFactory: ZigTestCompilerFactory;
}

startTestCompilerActor<ZigTestWorkerConfig>(createContext(), (ctx, out, factory) =>
	factory(ctx, {
		zigTestCompilerFactory: new ZigTestCompilerFactory(out)
	})
);
