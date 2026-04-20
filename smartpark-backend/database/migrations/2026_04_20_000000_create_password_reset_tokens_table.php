<?php

// Migration removed: password reset tokens table is no longer used because
// email/password reset flows were disabled per user request.

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // intentionally left blank
    }

    public function down(): void
    {
        // intentionally left blank
    }
};
