from enum import Enum

class PaymentSystemType(Enum):
  PAYPAL = "paypal"
  WEBMONEY = "webmoney"
  CAT_BANK = "cat-bank"







def payment(
  type: PaymentSystemType,
  base: int,
  amount: int
) -> int:
  raise NotImplementedError
