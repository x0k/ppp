import { testData, type TestCase } from "@/lib/testing";

import {
  PaymentSystemActionType,
  PaymentSystemType,
  case1,
  case2,
} from "./reference";

export enum CaseType {
  Simple = "simple",
  Complex = "complex",
}

export const CASE_TYPES = Object.values(CaseType);

export interface SimpleTestInput {
  paymentSystem: PaymentSystemType;
  base: number;
  amount: number;
}

export interface ComplexTestInput {
  paymentSystem: PaymentSystemType;
  base: number;
  action: PaymentSystemActionType;
  amount: number;
}

export interface Inputs {
  [CaseType.Simple]: SimpleTestInput;
  [CaseType.Complex]: ComplexTestInput;
}

export interface Outputs {
  [CaseType.Simple]: number;
  [CaseType.Complex]: number;
}

export const testCases: { [k in CaseType]: TestCase<Inputs[k], Outputs[k]> } = {
  [CaseType.Simple]: {
    name: "Case 1",
    data: [
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
      testData((input) => case1(input.paymentSystem, input.base, input.amount))
    ),
  },
  [CaseType.Complex]: {
    name: "Case 2",
    data: [
      {
        paymentSystem: PaymentSystemType.PayPal,
        base: 2,
        action: PaymentSystemActionType.Payment,
        amount: 1,
      },
      {
        paymentSystem: PaymentSystemType.PayPal,
        base: 2,
        action: PaymentSystemActionType.Payout,
        amount: 1,
      },
      {
        paymentSystem: PaymentSystemType.WebMoney,
        base: 2,
        action: PaymentSystemActionType.Payment,
        amount: 1,
      },
      {
        paymentSystem: PaymentSystemType.WebMoney,
        base: 4,
        action: PaymentSystemActionType.Payout,
        amount: 1,
      },
      {
        paymentSystem: PaymentSystemType.CatBank,
        base: 2,
        action: PaymentSystemActionType.Payment,
        amount: 1,
      },
      {
        paymentSystem: PaymentSystemType.CatBank,
        base: 8,
        action: PaymentSystemActionType.Payout,
        amount: 2,
      },
    ].map(
      testData((input) =>
        case2(input.paymentSystem, input.base, input.action, input.amount)
      )
    ),
  },
};
