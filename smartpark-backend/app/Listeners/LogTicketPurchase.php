<?php

namespace App\Listeners;

use App\Events\TicketPurchased;
use App\Models\AccountingEntry;
use Illuminate\Contracts\Queue\ShouldQueue;

class LogTicketPurchase
{
    public function handle(TicketPurchased $event)
    {
        $t = $event->ticket;
        $p = $event->payment;

        $meta = [
            'vehicle_id' => $t->vehicle_id,
            'zone_id' => $t->zone_id,
            'payment_id' => $p->id,
            'transaction_ref' => $p->transaction_ref ?? null,
        ];

        // include card metadata when available from the payment simulator
        if (! empty($event->meta) && is_array($event->meta)) {
            $meta['card'] = $event->meta;
        }

        AccountingEntry::create([
            'type' => 'TICKET_SALE',
            'reference_id' => $t->id,
            'reference_type' => 'ticket',
            'amount' => $p->amount,
            'meta' => $meta,
        ]);
    }
}
