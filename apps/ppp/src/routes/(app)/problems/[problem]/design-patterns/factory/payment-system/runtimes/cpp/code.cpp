#include <cstdlib>

enum class SystemType {
  PayPal,
  WebMoney,
  CatBank
};

class Solution {
public:
  static int payment(SystemType type, int base, int amount) {
    (void)type;
    (void)base;
    (void)amount;
    std::abort(); // Not implemented
  }
};
