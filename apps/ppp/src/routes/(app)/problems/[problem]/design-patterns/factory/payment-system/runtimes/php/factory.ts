import { makeRemoteTestCompilerFactory } from 'libs/testing/actor';

import Worker from '$lib/runtime/php/test-worker?worker';

// Only type imports are allowed

import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';
import type { TestCompilerFactory } from 'libs/testing';

import type { PhpTestWorkerConfig } from '$lib/runtime/php/test-worker';

import type { Input, Output } from '../../tests-data';
import type { PaymentSystemType } from '../../reference';

export const factory: TestCompilerFactory<RemoteCompilerFactoryOptions, Input, Output> =
	makeRemoteTestCompilerFactory(Worker, (ctx, { phpTestCompilerFactory }: PhpTestWorkerConfig) => {
		const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
			paypal: 'PaymentSystemType::PAYPAL',
			webmoney: 'PaymentSystemType::WEBMONEY',
			'cat-bank': 'PaymentSystemType::CAT_BANK'
		};
		return phpTestCompilerFactory.create(
			ctx,
			({ paymentSystem, base, amount }) =>
				`payment(${PHP_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount})`
		);
	});
