import type { UniversalFactory } from "testing/actor";
import type { CustomType } from 'testing-gleam/stdlib/gleam.mjs'

import type { GleamUniversalFactoryData } from "@/lib/workers/gleam";

import type { PaymentSystemType } from "../reference";
import type { Input, Output } from "../tests-data";

interface TestingModule {
  PayPal: CustomType;
  WebMoney: CustomType;
  CatBank: CustomType;
  payment(type: CustomType, base: number, amount: number): number;
}

export const factory: UniversalFactory<
  Input,
  Output,
  GleamUniversalFactoryData<TestingModule, Input, Output>
> = ({ makeTestRunnerFactory }) => {
  return makeTestRunnerFactory(async (m, input) => {
    const systems: Record<PaymentSystemType, CustomType> = {
      "cat-bank": m.CatBank,
      paypal: m.PayPal,
      webmoney: m.WebMoney,
    };
    return m.payment(systems[input.paymentSystem], input.base, input.amount);
  });
};
