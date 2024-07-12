struct Args {
  [JsonPropertyName("base")]
  public int Base;
  [JsonPropertyName("amount")]
  public int Amount;

  [JsonPropertyName("paymentType")]
  public string PaymentType;
}