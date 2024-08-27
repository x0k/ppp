enum SystemType {
  PAY_PAL,
  WEB_MONEY,
  CAT_BANK
}

class Payment {
  public static int execute(SystemType type, int base, int amount) {
    throw new RuntimeException("Not implemented");
  }
}