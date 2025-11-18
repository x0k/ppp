import { makeRemoteTestCompilerFactory } from 'libs/testing/actor';

import Worker from '$lib/runtime/ts/test-worker?worker';

// Only type imports are allowed

import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';
import type { TestCompilerFactory } from 'libs/testing';

import type { TsTestWorkerConfig } from '$lib/runtime/ts/test-worker';

import type { PaymentSystemType } from '../../reference';
import type { Input, Output } from '../../tests-data';

interface TestingModule {
	payment(type: PaymentSystemType, base: number, amount: number): number;
}

export const factory: TestCompilerFactory<RemoteCompilerFactoryOptions, Input, Output> =
	makeRemoteTestCompilerFactory(Worker, async (_, { tsTestCompilerFactory }: TsTestWorkerConfig) =>
		tsTestCompilerFactory.create(async (m: TestingModule, input) =>
			m.payment(input.paymentSystem, input.base, input.amount)
		)
	);
