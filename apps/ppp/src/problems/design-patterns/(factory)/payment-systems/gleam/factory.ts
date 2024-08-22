import { makeRemoteTestCompilerFactory } from "testing/actor";

import Worker from "@/adapters/runtime/gleam/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "testing";
import type { CustomType } from "gleam-runtime/stdlib/gleam.mjs";

import type { GleamTestWorkerConfig } from "@/adapters/runtime/gleam/test-worker";

import type { PaymentSystemType } from "../reference";
import type { Input, Output } from "../tests-data";

interface TestingModule {
  PayPal: CustomType;
  WebMoney: CustomType;
  CatBank: CustomType;
  payment(type: CustomType, base: number, amount: number): number;
}

export const factory: TestCompilerFactory<Input, Output> =
  makeRemoteTestCompilerFactory(
    Worker,
    (ctx, { gleamTestCompilerFactory }: GleamTestWorkerConfig) =>
      gleamTestCompilerFactory.create(ctx, async (m: TestingModule, input) => {
        const systems: Record<PaymentSystemType, CustomType> = {
          "cat-bank": m.CatBank,
          paypal: m.PayPal,
          webmoney: m.WebMoney,
        };
        return m.payment(
          systems[input.paymentSystem],
          input.base,
          input.amount
        );
      })
  );
