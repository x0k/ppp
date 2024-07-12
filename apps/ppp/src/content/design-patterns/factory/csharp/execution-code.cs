var args = JsonSerializer.Deserialize<Args>(jsonArguments);
var type = args.PaymentType switch {
  "paypal" => payment.SystemType.PayPal,
  "webmoney" => payment.SystemType.WebMoney,
  "catbank" => payment.SystemType.CatBank,
  _ => throw new System.Exception("Unknown payment type")
};
var result = payment.Payment.Execute(type, args.Base, args.Amount);
