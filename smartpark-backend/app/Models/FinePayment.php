<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinePayment extends Model
{
    protected $table = 'fine_payments';

    protected $fillable = [
        'fine_id',
        'amount',
        'method',
        'status',
        'paid_at',
        'transaction_ref'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
    ];

    public function fine()
    {
        return $this->belongsTo(Fine::class);
    }
}

