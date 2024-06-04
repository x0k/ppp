const enum PaymentSystemType {
  PayPal = "paypal",
  WebMoney = "webmoney",
  CatBank = "cat-bank",
}







export function payment(
  type: PaymentSystemType,
  base: number,
  amount: number
): number {
  throw new Error("Not implemented");
}
