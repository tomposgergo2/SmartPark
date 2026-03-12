<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Vehicle;

class FineTest extends TestCase
{
    public function test_officer_can_issue_and_pay_fine()
    {
        $login = $this->postJson('/api/auth/login', [
            'email' => 'officer@smartpark.test',
            'password' => 'password',
        ]);
        $login->assertStatus(200);
        $token = $login->json('token');

        $vehicle = Vehicle::first();

        $issue = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/officer/fines', [
                'vehicle_id' => $vehicle->id,
                'zone_id' => 1,
                'reason' => 'NO_VALID_TICKET'
            ]);

        $issue->assertStatus(201)->assertJsonStructure(['id','vehicle_id']);
        $fineId = $issue->json('id');

        $pay = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/fines/' . $fineId . '/pay', []);

        $pay->assertStatus(200)->assertJsonStructure(['fine','payment']);
    }
}
