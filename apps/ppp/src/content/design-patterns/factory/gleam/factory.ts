import type { Brand } from 'libs/type'
import type { UniversalFactory } from "testing/actor";

import type { GleamUniversalFactoryData } from "@/lib/workers/gleam";

import type { PaymentSystemType } from "../reference";
import type { Input, Output } from "../tests-data";

type SystemType = Brand<"SystemType", object>

interface TestingModule {
  PayPal: SystemType;
  WebMoney: SystemType;
  CatBank: SystemType;
  payment(type: SystemType, base: number, amount: number): number;
}

export const factory: UniversalFactory<
  Input,
  Output,
  GleamUniversalFactoryData<TestingModule, Input, Output>
> = ({ makeTestRunnerFactory }) => {
  return makeTestRunnerFactory(async (m, input) => {
    const systems: Record<PaymentSystemType, SystemType> = {
      "cat-bank": m.CatBank,
      paypal: m.PayPal,
      webmoney: m.WebMoney,
    };
    return m.payment(systems[input.paymentSystem], input.base, input.amount);
  });
};
