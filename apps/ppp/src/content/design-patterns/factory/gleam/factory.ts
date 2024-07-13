// Only type imports are allowed
import type { UniversalFactory } from "testing/actor";
import type { CustomType } from "gleam-runtime/stdlib/gleam.mjs";

import type { GleamTestWorkerConfig } from "@/adapters/runtime/gleam/test-workers";

import type { PaymentSystemType } from "../reference";
import type { Input, Output } from "../tests-data";

interface TestingModule {
  PayPal: CustomType;
  WebMoney: CustomType;
  CatBank: CustomType;
  payment(type: CustomType, base: number, amount: number): number;
}

export const factory: UniversalFactory<GleamTestWorkerConfig, Input, Output> = (
  ctx,
  { gleamTestCompilerFactory }
) =>
  gleamTestCompilerFactory.create(ctx, async (m: TestingModule, input) => {
    const systems: Record<PaymentSystemType, CustomType> = {
      "cat-bank": m.CatBank,
      paypal: m.PayPal,
      webmoney: m.WebMoney,
    };
    return m.payment(systems[input.paymentSystem], input.base, input.amount);
  });
