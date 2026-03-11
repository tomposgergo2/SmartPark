<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fine extends Model
{
    protected $table = 'fines';

    protected $fillable = [
        'vehicle_id',
        'issued_by_user_id',
        'zone_id',
        'reason',
        'amount',
        'status',
        'note',
        'issued_at',
        'paid_at',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by_user_id');
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function payments()
    {
        return $this->hasMany(FinePayment::class);
    }
}
