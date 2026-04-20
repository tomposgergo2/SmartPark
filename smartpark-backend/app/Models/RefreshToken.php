<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class RefreshToken extends Model
{
    protected $table = 'refresh_tokens';
    protected $fillable = ['user_id', 'token_hash', 'expires_at', 'last_used_at', 'ip_address', 'user_agent'];
    protected $casts = [
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
