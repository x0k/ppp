// Only type imports are allowed
import type { UniversalFactory } from "testing/actor";

import type { RustUniversalFactoryData } from "@/lib/workers/rust";

import type { Input, Output } from "../tests-data";
import type { PaymentSystemType } from "../reference";

export const factory: UniversalFactory<
  Input,
  Output,
  RustUniversalFactoryData<Input, Output>
> = ({ makeTestRunnerFactory }) => {
  const RUST_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
    paypal: "PaymentSystemType::PayPal",
    webmoney: "PaymentSystemType::WebMoney",
    "cat-bank": "PaymentSystemType::CatBank",
  };
  return makeTestRunnerFactory(
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
};
