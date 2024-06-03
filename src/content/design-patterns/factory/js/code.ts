const enum PaymentSystemType {
  PayPal = "paypal",
  WebMoney = "webmoney",
  CatBank = "cat-bank",
}







export function case1(
  type: PaymentSystemType,
  base: number,
  amount: number
): number {
  throw new Error("Not implemented");
}

const enum PaymentSystemActionType {
  Payment = "payment",
  Payout = "payout",
}







export function case2(
  type: PaymentSystemType,
  base: number,
  action: PaymentSystemActionType,
  amount: number
): number {
  throw new Error("Not implemented");
}
