import { makeRemoteTestCompilerFactory } from 'libs/testing/actor';

import Worker from '$lib/runtime/java/test-worker?worker';

// Only type imports are allowed

import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';
import type { TestCompilerFactory } from 'libs/testing';

import type { JavaTestWorkerConfig } from '$lib/runtime/java/test-worker';

import type { Input, Output } from '../../tests-data';
import type { PaymentSystemType } from '../../reference';

export const factory: TestCompilerFactory<RemoteCompilerFactoryOptions, Input, Output> =
	makeRemoteTestCompilerFactory(
		Worker,
		(ctx, { javaTestCompilerFactory, util }: JavaTestWorkerConfig) => {
			const JAVA_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
				paypal: 'PAY_PAL',
				webmoney: 'WEB_MONEY',
				'cat-bank': 'CAT_BANK'
			};
			return javaTestCompilerFactory.create(ctx, {
				classDefinitions: `static native String getSystemType();
  static native int getBase();
  static native int getAmount();
  static native void saveResult(int result);`,
				mainMethodBody: `saveResult(Solution.payment(
      SystemType.valueOf(getSystemType()),
      getBase(),
      getAmount()
    ));`,
				nativesFactory: (input, save) => ({
					// @ts-expect-error TODO: import thread type
					'getSystemType()Ljava/lang/String;': (t) =>
						util.initString(t.getBsCl(), JAVA_PAYMENT_SYSTEM_TYPES[input.paymentSystem]),
					'getBase()I': () => input.base,
					'getAmount()I': () => input.amount,
					'saveResult(I)V': (_: unknown, result: number) => save(result)
				})
			});
		}
	);
