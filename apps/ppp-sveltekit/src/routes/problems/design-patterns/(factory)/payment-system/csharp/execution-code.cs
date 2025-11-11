var args = JsonSerializer.Deserialize<Args>(jsonArguments);
var type = args.SystemType switch {
  "paypal" => SystemType.PayPal,
  "webmoney" => SystemType.WebMoney,
  "catbank" => SystemType.CatBank,
  _ => throw new System.Exception("Unknown payment type")
};
var result = Solution.Payment(type, args.Base, args.Amount);
