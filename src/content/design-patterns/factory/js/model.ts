import type { PaymentSystemActionType, PaymentSystemType } from "../reference";

export interface TestingModule {
  case1(type: PaymentSystemType, base: number, amount: number): number;
  case2(
    type: PaymentSystemType,
    base: number,
    action: PaymentSystemActionType,
    amount: number
  ): number;
}
