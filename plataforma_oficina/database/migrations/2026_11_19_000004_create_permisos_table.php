<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permisos', function (Blueprint $table): void {
            $table->id();
            $table->string('clave', 100)->unique();
            $table->string('nombre', 150);
            $table->string('modulo', 50);
            $table->string('descripcion', 255)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->index(['modulo', 'activo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permisos');
    }
};
