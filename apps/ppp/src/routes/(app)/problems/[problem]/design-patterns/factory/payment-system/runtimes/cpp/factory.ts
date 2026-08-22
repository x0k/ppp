import { makeRemoteTestCompilerFactory } from 'libs/testing/actor';

import Worker from '$lib/runtime/cpp/test-worker?worker';

// Only type imports are allowed

import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';
import type { TestCompilerFactory } from 'libs/testing';

import type { CppTestWorkerConfig } from '$lib/runtime/cpp/test-worker';

import type { Input, Output } from '../../tests-data';
import type { PaymentSystemType } from '../../reference';

export const factory: TestCompilerFactory<RemoteCompilerFactoryOptions, Input, Output> =
	makeRemoteTestCompilerFactory(Worker, (ctx, { cppTestCompilerFactory }: CppTestWorkerConfig) => {
		const CPP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
			paypal: 'SystemType::PayPal',
			webmoney: 'SystemType::WebMoney',
			'cat-bank': 'SystemType::CatBank'
		};
		return cppTestCompilerFactory.create(
			ctx,
			({ paymentSystem, amount, base }) =>
				`output_content = std::to_string(Solution::payment(${CPP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount}));`,
			(result) => {
				const r = parseInt(result, 10);
				if (isNaN(r)) {
					throw new Error(`Invalid result type: ${result}, expected number`);
				}
				return r;
			}
		);
	});
