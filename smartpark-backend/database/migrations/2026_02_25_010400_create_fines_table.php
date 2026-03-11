<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnDelete();
            $table->foreignId('issued_by_user_id')->nullable()->constrained('users');
            $table->foreignId('zone_id')->nullable()->constrained('zones');
            $table->text('reason')->nullable();
            $table->integer('amount')->default(0);
            $table->string('status')->default('UNPAID');
            $table->text('note')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('fines');
    }
};
