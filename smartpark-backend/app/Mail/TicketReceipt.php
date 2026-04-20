<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Ticket;
use App\Models\Payment;

class TicketReceipt extends Mailable
{
    use Queueable, SerializesModels;

    public Ticket $ticket;
    public Payment $payment;

    /**
     * Create a new message instance.
     */
    public function __construct(Ticket $ticket, Payment $payment)
    {
        $this->ticket = $ticket;
        $this->payment = $payment;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('SmartPark - Your ticket receipt')
                    ->view('emails.ticket_receipt')
                    ->with([
                        'ticket' => $this->ticket,
                        'payment' => $this->payment,
                    ]);
    }
}
