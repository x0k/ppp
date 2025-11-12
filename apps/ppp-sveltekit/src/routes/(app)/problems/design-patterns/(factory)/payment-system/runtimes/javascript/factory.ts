import { makeRemoteTestCompilerFactory } from "libs/testing/actor";

import Worker from "$lib/runtime/js/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "libs/testing";

import type { JsTestWorkerConfig } from "$lib/runtime/js/test-worker";

import type { Input, Output } from "../../tests-data";
import type { PaymentSystemType } from "../../reference";

interface TestingModule {
  payment(type: PaymentSystemType, base: number, amount: number): number;
}

export const factory: TestCompilerFactory<Input, Output> =
  makeRemoteTestCompilerFactory(
    Worker,
    async (_, { jsTestCompilerFactory }: JsTestWorkerConfig) =>
      jsTestCompilerFactory.create(async (m: TestingModule, input) =>
        m.payment(input.paymentSystem, input.base, input.amount)
      )
  );
