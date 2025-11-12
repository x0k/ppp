import { makeRemoteTestCompilerFactory } from "libs/testing/actor";

import Worker from "$lib/runtime/rust/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "libs/testing";

import type { RustTestWorkerConfig } from "$lib/runtime/rust/test-worker";

import type { Input, Output } from "../../tests-data";
import type { PaymentSystemType } from "../../reference";

export const factory: TestCompilerFactory<Input, Output> =
  makeRemoteTestCompilerFactory(
    Worker,
    (ctx, { rustTestCompilerFactory }: RustTestWorkerConfig) => {
      const RUST_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
        paypal: "PaymentSystemType::PayPal",
        webmoney: "PaymentSystemType::WebMoney",
        "cat-bank": "PaymentSystemType::CatBank",
      };
      return rustTestCompilerFactory.create(
        ctx,
        ({ paymentSystem, amount, base }) =>
          `let str = payment(${RUST_PAYMENT_SYSTEM_TYPES[paymentSystem]}, ${base}, ${amount}).to_string();
  let output_content = str.as_bytes();`,
        (result) => {
          const r = parseInt(result, 10);
          if (isNaN(r)) {
            throw new Error(`Invalid result type: ${result}, expected number`);
          }
          return r;
        }
      );
    }
  );
