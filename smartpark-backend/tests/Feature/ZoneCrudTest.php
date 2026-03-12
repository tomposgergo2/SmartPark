<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Zone;

class ZoneCrudTest extends TestCase
{
    public function test_admin_can_create_update_delete_zone()
    {
        $login = $this->postJson('/api/auth/login', [
            'email' => 'admin@smartpark.test',
            'password' => 'password',
        ]);

        $login->assertStatus(200);
        $token = $login->json('token');

        $create = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/zones', [
                'name' => 'Test Zone X',
                'rate_per_hour' => 100,
                'min_minutes' => 30,
                'max_minutes' => 120,
                'fine_amount' => 1000,
                'active' => true,
            ]);

        $create->assertStatus(201)->assertJsonStructure(['id']);
        $zoneId = $create->json('id');

        $update = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/zones/' . $zoneId, ['rate_per_hour' => 150]);

        $update->assertStatus(200)->assertJsonFragment(['rate_per_hour' => 150]);

        $delete = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->deleteJson('/api/zones/' . $zoneId);

        $delete->assertStatus(200);
    }
}
