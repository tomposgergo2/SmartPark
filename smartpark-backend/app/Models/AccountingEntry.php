<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountingEntry extends Model
{
    protected $table = 'accounting_entries';

    protected $fillable = [
        'type',
        'reference_id',
        'reference_type',
        'amount',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];
}
