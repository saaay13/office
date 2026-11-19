<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('rol_id')->constrained('roles');
            $table->foreignId('area_id')->constrained('instancias_coordinacion');
            $table->foreignId('cargo_id')->nullable()->constrained('cargos')->nullOnDelete();
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('usuario', 50)->unique();
            $table->string('email', 150)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password', 255);
            $table->rememberToken();
            $table->string('telefono', 30)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamp('ultimo_acceso_at')->nullable();
            $table->timestamps();

            $table->index(['area_id', 'activo']);
            $table->index('rol_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
