<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'ticket_id',
        'amount',
        'method',
        'status',
        'paid_at',
        'transaction_ref',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
