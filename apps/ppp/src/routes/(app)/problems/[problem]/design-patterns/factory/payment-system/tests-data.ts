import { testCase } from "libs/testing";

import { PaymentSystemType, payment } from "./reference";

export interface Input {
  paymentSystem: PaymentSystemType;
  base: number;
  amount: number;
}

export type Output = number;

export const testCases = [
  {
    paymentSystem: PaymentSystemType.PayPal,
    base: 1,
    amount: 1,
  },
  {
    paymentSystem: PaymentSystemType.WebMoney,
    base: 1,
    amount: 1,
  },
  {
    paymentSystem: PaymentSystemType.CatBank,
    base: 1,
    amount: 1,
  },
].map(
  testCase((input) => payment(input.paymentSystem, input.base, input.amount))
);
