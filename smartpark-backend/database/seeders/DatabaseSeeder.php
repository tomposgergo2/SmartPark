<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a couple of demo users for the frontend (password: "password")
        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'user@smartpark.com',
            'role' => \App\Models\User::ROLE_USER,
        ]);

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@smartpark.com',
            'role' => \App\Models\User::ROLE_ADMIN,
        ]);

        // Additional demo data: zones, vehicles, tickets, payments
        $this->call(DemoDataSeeder::class);
    }
}
