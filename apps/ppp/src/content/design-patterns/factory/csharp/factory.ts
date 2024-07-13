// Only type imports are allowed

import type { UniversalFactory } from "testing/actor";

import type { DotnetTestWorkerConfig } from "@/adapters/runtime/dotnet/test-worker";

import type { Input, Output } from "../tests-data";

export const factory: UniversalFactory<
  DotnetTestWorkerConfig,
  Input,
  Output
> = (ctx, { dotnetTestCompilerFactory, makeExecutionCode }) =>
  dotnetTestCompilerFactory.create(ctx, {
    executionCode: makeExecutionCode({
      additionalDefinitions: `struct Args {
  [JsonPropertyName("base")]
  public int Base { get; set; }
  [JsonPropertyName("amount")]
  public int Amount { get; set; }

  [JsonPropertyName("paymentSystem")]
  public string SystemType { get; set; }
}`,
      executionCode: `var args = JsonSerializer.Deserialize<Args>(jsonArguments);
var type = args.SystemType switch {
  "paypal" => payment.SystemType.PayPal,
  "webmoney" => payment.SystemType.WebMoney,
  "catbank" => payment.SystemType.CatBank,
  _ => throw new System.Exception("Unknown payment type")
};
var result = payment.Payment.Execute(type, args.Base, args.Amount);`,
    }),
  });
