<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('instancias_coordinacion', function (Blueprint $table): void {
            $table->foreign('responsable_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('instancias_coordinacion', function (Blueprint $table): void {
            $table->dropForeign(['responsable_id']);
        });
    }
};
