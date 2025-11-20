import { makeRemoteTestCompilerFactory } from 'libs/testing/actor';

import Worker from '$lib/runtime/ruby/test-worker?worker';

// Only type imports are allowed

import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';
import type { TestCompilerFactory } from 'libs/testing';

import type { RubyTestWorkerConfig } from '$lib/runtime/ruby/test-worker';

import type { Input, Output } from '../../tests-data';

export const factory: TestCompilerFactory<RemoteCompilerFactoryOptions, Input, Output> =
	makeRemoteTestCompilerFactory(Worker, (ctx, { rubyTestCompilerFactory }: RubyTestWorkerConfig) =>
		rubyTestCompilerFactory.create(
			ctx,
			({ paymentSystem, base, amount }) => `payment("${paymentSystem}", ${base}, ${amount})`
		)
	);
