<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Zone;

class ZonePolicy
{
    public function before(User $user, $ability)
    {
        // allow admins to do everything
        if ($user->role === User::ROLE_ADMIN) {
            return true;
        }
    }

    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Zone $zone)
    {
        return $zone->active;
    }

    public function create(User $user)
    {
        // only admin allowed (handled in before)
        return false;
    }

    public function update(User $user, Zone $zone)
    {
        return false;
    }

    public function delete(User $user, Zone $zone)
    {
        return false;
    }
}
