import { makeRemoteTestCompilerFactory } from 'libs/testing/actor';

import Worker from '$lib/runtime/lua/test-worker?worker';

// Only type imports are allowed

import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';
import type { TestCompilerFactory } from 'libs/testing';

import type { LuaTestWorkerConfig } from '$lib/runtime/lua/test-worker';

import type { Input, Output } from '../../tests-data';
import type { PaymentSystemType } from '../../reference';

export const factory: TestCompilerFactory<RemoteCompilerFactoryOptions, Input, Output> =
	makeRemoteTestCompilerFactory(Worker, (ctx, { luaTestCompilerFactory }: LuaTestWorkerConfig) => {
		const LUA_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
			paypal: "'paypal'",
			webmoney: "'webmoney'",
			'cat-bank': "'cat-bank'"
		};
		return luaTestCompilerFactory.create(
			ctx,
			({ paymentSystem, amount, base }) =>
				`output_content = payment(${LUA_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount})`,
			(result) => {
				const r = Number(result);
				if (isNaN(r)) {
					throw new Error(`Invalid result type: ${result}, expected number`);
				}
				return r;
			}
		);
	});
