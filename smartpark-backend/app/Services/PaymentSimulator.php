<?php

namespace App\Services;

use Illuminate\Support\Str;

class PaymentSimulator
{
    /**
     * Simulate a payment and return simulated fields for persistence.
     *
     * @param string $method 'CARD_SIM' or 'CASH_SIM'
     * @param int $amount amount in cents
     * @return array
     */
    public static function simulate(string $method, int $amount): array
    {
        $method = $method ?: 'CARD_SIM';

        // basic success/failure simulation (currently always success)
        $status = 'SUCCESS';

        // transaction reference simulating a payment gateway reference
        $transactionRef = 'SIM-' . strtoupper(Str::random(8));

        // if card simulation, add some card-like metadata
        $card = null;
        if ($method === 'CARD_SIM') {
            $brands = ['VISA', 'MASTERCARD', 'AMEX'];
            $brand = $brands[array_rand($brands)];
            $last4 = str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT);
            $auth = strtoupper(substr(hash('sha256', $transactionRef . now()->timestamp), 0, 10));

            $card = [
                'brand' => $brand,
                'last4' => $last4,
                'auth_code' => $auth,
            ];
        }

        return [
            'method' => $method,
            'status' => $status,
            'transaction_ref' => $transactionRef,
            'card' => $card,
        ];
    }
}
