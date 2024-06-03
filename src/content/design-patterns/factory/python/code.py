from enum import Enum

class PaymentSystemType(Enum):
  PAYPAL = "paypal"
  WEBMONEY = "webmoney"
  CAT_BANK = "cat-bank"







def case1(
  type: PaymentSystemType,
  base: int,
  amount: int
) -> int:
  raise NotImplementedError

class PaymentSystemActionType(Enum):
  PAYMENT = "payment"
  PAYOUT = "payout"








def case2(
  type: PaymentSystemType,
  base: int,
  action: PaymentSystemActionType,
  amount: int
) -> int:
  raise NotImplementedError