const std = @import("std");

const PaymentSystemType = enum { paypal, webmoney, cat_bank };

fn payment(tp: PaymentSystemType, base: i64, amount: i64) i64 {
    _ = tp;
    _ = base;
    _ = amount;
    @panic("Not implemented");
}
