<?php

final class CatBankProcessor implements PaymentProcessorInterface
{

    public function payout()
    {
        echo 'Payout from CatBank';
    }

    public function payment()
    {
        echo 'Payment from CatBank';
    }
}
