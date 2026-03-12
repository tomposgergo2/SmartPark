<?php

namespace App\Events;

use Illuminate\Queue\SerializesModels;
use App\Models\Ticket;
use App\Models\Payment;

class TicketPurchased
{
    use SerializesModels;

    public Ticket $ticket;
    public Payment $payment;
    public ?array $meta = null;

    public function __construct(Ticket $ticket, Payment $payment, ?array $meta = null)
    {
        $this->ticket = $ticket;
        $this->payment = $payment;
        $this->meta = $meta;
    }
}
