import { makeRemoteTestCompilerFactory } from "testing/actor";

import Worker from "@/adapters/runtime/rust/test-worker?worker";

// Only type imports are allowed

import type { TestCompilerFactory } from "testing";

import type { RustTestWorkerConfig } from "@/adapters/runtime/rust/test-worker";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

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
