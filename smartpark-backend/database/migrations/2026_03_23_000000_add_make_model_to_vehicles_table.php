<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('vehicles', function (Blueprint $table) {
            // Make and model are optional to avoid breaking existing records
            $table->string('make', 100)->nullable()->after('plate_number');
            $table->string('model', 100)->nullable()->after('make');
        });
    }

    public function down()
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['make', 'model']);
        });
    }
};
