<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Zone;
use App\Models\Fine;
use App\Models\User;
use App\Policies\ZonePolicy;
use App\Policies\FinePolicy;
use App\Policies\UserPolicy;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // register policies
    Gate::policy(Zone::class, ZonePolicy::class);
    Gate::policy(Fine::class, FinePolicy::class);
    Gate::policy(User::class, UserPolicy::class);
    }
}
