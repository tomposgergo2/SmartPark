<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function before(User $user, $ability)
    {
        if ($user->role === User::ROLE_ADMIN) {
            return true;
        }
    }

    public function viewAny(User $user)
    {
        return $user->role === User::ROLE_ADMIN;
    }

    public function create(User $user)
    {
        return $user->role === User::ROLE_ADMIN;
    }

    public function update(User $user)
    {
        return $user->role === User::ROLE_ADMIN;
    }
}
