export const enum PaymentSystemType {
  PayPal = "paypal",
  WebMoney = "webmoney",
  CatBank = "cat-bank",
}

interface PaymentSystem {
  payment(amount: number): number;
  payout(amount: number): number;
}

type PaymentSystemFactory = (base: number) => PaymentSystem;

const paymentSystemFactories: Record<PaymentSystemType, PaymentSystemFactory> =
  {
    [PaymentSystemType.PayPal]: (base) => ({
      payment: (amount: number) => base + amount,
      payout: (amount: number) => base - amount,
    }),
    [PaymentSystemType.WebMoney]: (base) => ({
      payment: (amount: number) => base + 2 * amount,
      payout: (amount: number) => base - 2 * amount,
    }),
    [PaymentSystemType.CatBank]: (base) => ({
      payment: (amount: number) => base * amount,
      payout: (amount: number) => base / amount,
    }),
  };

export function payment(
  type: PaymentSystemType,
  base: number,
  amount: number
): number {
  return paymentSystemFactories[type](base).payment(amount);
}
