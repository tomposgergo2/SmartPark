<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Fine;

class FinePolicy
{
    public function before(User $user, $ability)
    {
        if ($user->role === User::ROLE_ADMIN) {
            return true;
        }
    }

    // who can issue fines
    public function issue(User $user)
    {
        return $user->role === User::ROLE_OFFICER;
    }

    // who can pay fines — any authenticated user can pay their own fine (controller can enforce ownership)
    public function pay(User $user, Fine $fine)
    {
        return $user->id === $fine->vehicle->user_id || $user->role === User::ROLE_ADMIN || $user->role === User::ROLE_OFFICER;
    }
}
