<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Vehicle;

class TicketTest extends TestCase
{
    public function test_purchase_ticket_happy_path()
    {
        // login
        $login = $this->postJson('/api/auth/login', [
            'email' => 'user@smartpark.test',
            'password' => 'password',
        ]);

        $login->assertStatus(200);
        $token = $login->json('token');

        // use first vehicle from DB
        $vehicle = Vehicle::first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/tickets', [
                'vehicle_id' => $vehicle->id,
                'zone_id' => 1,
                'minutes' => 60,
            ]);

        $response->assertStatus(201)->assertJsonStructure(['ticket','payment']);
    }
}
