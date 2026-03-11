<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    protected $table = 'zones';

    protected $fillable = [
        'name',
        'rate_per_hour',
        'min_minutes',
        'max_minutes',
        'fine_amount',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
