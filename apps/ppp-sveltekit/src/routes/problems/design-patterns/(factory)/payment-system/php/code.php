<?php

enum PaymentSystemType: string {
    case PAYPAL = 'paypal';
    case WEBMONEY = 'webmoney';
    case CAT_BANK = 'cat-bank';
}





// Выполните операцию payment для платежной системы `type`
function payment(PaymentSystemType $type, int $base, int $amount): int {

}
