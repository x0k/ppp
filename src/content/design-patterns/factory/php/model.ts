import { PaymentSystemActionType, PaymentSystemType } from "../reference";

export const PHP_PAYMENT_SYSTEM_TYPES: Record<PaymentSystemType, string> = {
  [PaymentSystemType.PayPal]: "PaymentSystemType::PAYPAL",
  [PaymentSystemType.WebMoney]: "PaymentSystemType::WEBMONEY",
  [PaymentSystemType.CatBank]: "PaymentSystemType::CAT_BANK",
};

export const PHP_PAYMENT_SYSTEM_ACTION_TYPES: Record<
  PaymentSystemActionType,
  string
> = {
  [PaymentSystemActionType.Payment]: "PaymentSystemActionType::PAYMENT",
  [PaymentSystemActionType.Payout]: "PaymentSystemActionType::PAYOUT",
};
