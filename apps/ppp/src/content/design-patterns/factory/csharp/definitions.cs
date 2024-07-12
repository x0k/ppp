struct Args {
  [JsonPropertyName("base")]
  public int Base { get; set; }
  [JsonPropertyName("amount")]
  public int Amount { get; set; }

  [JsonPropertyName("paymentSystem")]
  public string SystemType { get; set; }
}