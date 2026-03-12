<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    public function test_login_returns_token()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'user@smartpark.test',
            'password' => 'password',
        ]);

        $response->assertStatus(200)->assertJsonStructure(['token','user']);
    }
}
