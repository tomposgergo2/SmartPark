<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Zone;
use App\Models\Vehicle;
use App\Models\Ticket;
use App\Models\Payment;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // find demo user
        $user = User::where('email', 'user@smartpark.com')->first();
        if (! $user) {
            $this->command->info('Demo user not found, skipping demo data seeding.');
            return;
        }

        // Create some zones
        $downtown = Zone::firstOrCreate(
            ['name' => 'Downtown'],
            ['rate_per_hour' => 200, 'min_minutes' => 15, 'max_minutes' => 720, 'fine_amount' => 500, 'active' => true]
        );

        $uptown = Zone::firstOrCreate(
            ['name' => 'Uptown'],
            ['rate_per_hour' => 150, 'min_minutes' => 15, 'max_minutes' => 480, 'fine_amount' => 400, 'active' => true]
        );

        // Create vehicles for demo user
        $vehicle1 = Vehicle::firstOrCreate(
            ['plate_number' => 'AAA-111'],
            ['user_id' => $user->id]
        );

        $vehicle2 = Vehicle::firstOrCreate(
            ['plate_number' => 'BBB-222'],
            ['user_id' => $user->id]
        );

        // Create a ticket for vehicle1 in Downtown (60 minutes)
        $start = Carbon::now();
        $end = (clone $start)->addMinutes(60);

        $ticket = Ticket::create([
            'vehicle_id' => $vehicle1->id,
            'zone_id' => $downtown->id,
            'start_time' => $start,
            'end_time' => $end,
            'price' => (int) ceil($downtown->rate_per_hour * (60 / 60)),
            'status' => 'ACTIVE',
        ]);

        // Payment for the ticket (simulated)
        Payment::create([
            'ticket_id' => $ticket->id,
            'amount' => $ticket->price,
            'method' => 'CARD_SIM',
            'status' => 'PAID',
            'paid_at' => Carbon::now(),
            'transaction_ref' => 'SIM-' . uniqid(),
        ]);

        // Extra ticket for vehicle2 in Uptown (30 minutes)
        $t2start = Carbon::now()->subHours(2);
        $t2end = (clone $t2start)->addMinutes(30);
        $ticket2 = Ticket::create([
            'vehicle_id' => $vehicle2->id,
            'zone_id' => $uptown->id,
            'start_time' => $t2start,
            'end_time' => $t2end,
            'price' => (int) ceil($uptown->rate_per_hour * (30 / 60)),
            'status' => 'EXPIRED',
        ]);

        Payment::create([
            'ticket_id' => $ticket2->id,
            'amount' => $ticket2->price,
            'method' => 'CARD_SIM',
            'status' => 'PAID',
            'paid_at' => Carbon::now()->subHours(2),
            'transaction_ref' => 'SIM-' . uniqid(),
        ]);

        $this->command->info('Demo zones, vehicles and tickets created.');
    }
}
