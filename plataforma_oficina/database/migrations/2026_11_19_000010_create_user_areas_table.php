<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_areas', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('area_id')->constrained('instancias_coordinacion')->cascadeOnDelete();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'area_id']);
            $table->index(['area_id', 'activo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_areas');
    }
};
