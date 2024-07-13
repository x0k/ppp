import { makeRemoteTestCompilerFactory } from "testing/actor";

import Worker from "@/adapters/runtime/js/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "testing";

import type { JsTestWorkerConfig } from "@/adapters/runtime/js/test-worker";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

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
