import { makeRemoteTestCompilerFactory } from 'libs/testing/actor';

import Worker from '$lib/runtime/dotnet/test-worker?worker';

// Only type imports are allowed

import type { RemoteCompilerFactoryOptions } from 'libs/compiler/actor';
import type { TestCompilerFactory } from 'libs/testing';

import type { DotnetTestWorkerConfig } from '$lib/runtime/dotnet/test-worker';

import type { Input, Output } from '../../tests-data';

export const factory: TestCompilerFactory<RemoteCompilerFactoryOptions, Input, Output> =
	makeRemoteTestCompilerFactory(
		Worker,
		(ctx, { dotnetTestCompilerFactory, makeExecutionCode }: DotnetTestWorkerConfig) => {
			const definitions = `struct Args {
  [JsonPropertyName("base")]
  public int Base { get; set; }
  [JsonPropertyName("amount")]
  public int Amount { get; set; }

  [JsonPropertyName("paymentSystem")]
  public string SystemType { get; set; }
}`;
			const executionCode = `var args = JsonSerializer.Deserialize<Args>(jsonArguments);
var type = args.SystemType switch {
  "paypal" => SystemType.PayPal,
  "webmoney" => SystemType.WebMoney,
  "catbank" => SystemType.CatBank,
  _ => throw new System.Exception("Unknown payment type")
};
var result = Solution.Payment(type, args.Base, args.Amount);

`;
			return dotnetTestCompilerFactory.create(ctx, {
				executionCode: makeExecutionCode({
					additionalDefinitions: definitions,
					executionCode
				})
			});
		}
	);
