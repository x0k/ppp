import { makeRemoteTestCompilerFactory } from "testing/actor";

import Worker from "@/adapters/runtime/go/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "testing";

import type { GoTestWorkerConfig } from "@/adapters/runtime/go/test-worker";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

export const factory: TestCompilerFactory<Input, Output> =
  makeRemoteTestCompilerFactory(
    Worker,
    (ctx, { goTestCompilerFactory }: GoTestWorkerConfig) => {
      const GO_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, number> = {
        paypal: 0,
        webmoney: 1,
        "cat-bank": 2,
      };
      return goTestCompilerFactory.create(
        ctx,
        ({ paymentSystem, amount, base }) =>
          `solution.Payment(solution.SystemType(${GO_PAYMENT_SYSTEM_TYPES[paymentSystem]}), ${base}, ${amount})`
      );
    }
  );
