<?php

enum PaymentSystemType: string {
    case PAYPAL = 'paypal';
    case WEBMONEY = 'webmoney';
    case CAT_BANK = 'cat-bank';
}





// Выполните операцию payment для платежной системы `type`
function case1(PaymentSystemType $type, int $amount): int {

}

enum PaymentSystemActionType: string {
    case PAYMENT = 'payment';
    case PAYOUT = 'payout';
}






// Выполните операцию `action` для платежной системы `type`
function case2(PaymentSystemType $type, PaymentSystemActionType $action, int $amount): int {

}
