import { makeRemoteTestCompilerFactory } from 'libs/testing/actor';

import Worker from '$lib/runtime/zig/test-worker?worker';

// Only type imports are allowed

import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';
import type { TestCompilerFactory } from 'libs/testing';

import type { ZigTestWorkerConfig } from '$lib/runtime/zig/test-worker';

import type { Input, Output } from '../../tests-data';
import type { PaymentSystemType } from '../../reference';

export const factory: TestCompilerFactory<RemoteCompilerFactoryOptions, Input, Output> =
	makeRemoteTestCompilerFactory(Worker, (ctx, { zigTestCompilerFactory }: ZigTestWorkerConfig) => {
		const ZIG_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
			paypal: '.paypal',
			webmoney: '.webmoney',
			'cat-bank': '.cat_bank'
		};
		return zigTestCompilerFactory.create(
			ctx,
			({ paymentSystem, amount, base }) =>
				`var buf: [64]u8 = undefined;
  const output_content = try std.fmt.bufPrint(&buf, "{d}", .{payment(${ZIG_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount})});`,
			(result) => {
				const r = parseInt(result, 10);
				if (isNaN(r)) {
					throw new Error(`Invalid result type: ${result}, expected number`);
				}
				return r;
			}
		);
	});
