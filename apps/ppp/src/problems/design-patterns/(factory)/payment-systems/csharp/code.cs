namespace payment
{

  public enum SystemType
  {
    PayPal,
    WebMoney,
    CatBank
  }

  public class Payment
  {
    public static int Execute(SystemType type, int bs, int amount)
    {
      throw new System.NotImplementedException();
    }
  }
}
