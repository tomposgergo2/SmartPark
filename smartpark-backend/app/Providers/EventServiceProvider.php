<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\TicketPurchased;
use App\Listeners\LogTicketPurchase;

class EventServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Event::listen(TicketPurchased::class, [LogTicketPurchase::class, 'handle']);
    }
}
