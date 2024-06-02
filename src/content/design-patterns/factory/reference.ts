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

export function case1(
  type: PaymentSystemType,
  base: number,
  amount: number
): number {
  return paymentSystemFactories[type](base).payment(amount);
}

export const enum PaymentSystemActionType {
  Payment = "payment",
  Payout = "payout",
}

type PaymentProcessor = (amount: number) => number;

type PaymentProcessorFactory = (system: PaymentSystem) => PaymentProcessor;

const paymentProcessorFactory: PaymentProcessorFactory = (system) => (amount) =>
  system.payment(amount);
const payoutProcessorFactory: PaymentProcessorFactory = (system) => (amount) =>
  system.payout(amount);

const paymentProcessorFactories: Record<
  PaymentSystemActionType,
  PaymentProcessorFactory
> = {
  [PaymentSystemActionType.Payment]: paymentProcessorFactory,
  [PaymentSystemActionType.Payout]: payoutProcessorFactory,
};

export function case2(
  type: PaymentSystemType,
  base: number,
  action: PaymentSystemActionType,
  amount: number
): number {
  return paymentProcessorFactories[action](paymentSystemFactories[type](base))(
    amount
  );
}
