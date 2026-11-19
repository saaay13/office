<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instancias_coordinacion', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('padre_id')->nullable()->constrained('instancias_coordinacion')->nullOnDelete();
            $table->string('codigo', 20)->nullable()->unique();
            $table->string('nombre', 150);
            $table->string('tipo', 30)->nullable();
            $table->unsignedSmallInteger('nivel')->nullable();
            $table->string('ruta', 255)->nullable()->index();
            $table->unsignedBigInteger('responsable_id')->nullable();
            $table->string('email', 150)->nullable();
            $table->string('telefono', 30)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index(['padre_id', 'activo']);
            $table->index(['tipo', 'activo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instancias_coordinacion');
    }
};
