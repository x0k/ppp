# PaymentSystemType Enum
module PaymentSystemType
  PAYPAL = "paypal"
  WEBMONEY = "webmoney"
  CAT_BANK = "cat-bank"
end

# @param {String} type - One of PaymentSystemType (PAYPAL, WEBMONEY, CAT_BANK)
# @param {Integer} base
# @param {Integer} amount
# @return {Integer}
def payment(type, base, amount)
  raise "Not implemented"
end
