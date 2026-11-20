<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLAS = [
        'instancias_coordinacion',
        'cargos',
        'users',
        'roles',
        'permisos',
    ];

    public function up(): void
    {
        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table): void {
                $table->enum('status', ['activo', 'desactivado', 'eliminado'])->default('activo');
            });

            DB::table($tabla)->where('activo', false)->update(['status' => 'desactivado']);
            DB::table($tabla)->where('activo', true)->update(['status' => 'activo']);
        }

        Schema::table('instancias_coordinacion', function (Blueprint $table): void {
            $table->index(['padre_id', 'status']);
            $table->index(['tipo', 'status']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->index(['area_id', 'status']);
        });

        Schema::table('permisos', function (Blueprint $table): void {
            $table->index(['modulo', 'status']);
        });

        $this->dropActivoIndexes();
        $this->dropUniques();

        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table): void {
                $table->dropColumn('activo');
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table): void {
                $table->boolean('activo')->default(true);
            });

            DB::table($tabla)->where('status', 'activo')->update(['activo' => true]);
            DB::table($tabla)->where('status', '!=', 'activo')->update(['activo' => false]);
        }

        Schema::table('instancias_coordinacion', function (Blueprint $table): void {
            $table->dropIndex(['padre_id', 'status']);
            $table->dropIndex(['tipo', 'status']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['area_id', 'status']);
        });

        Schema::table('permisos', function (Blueprint $table): void {
            $table->dropIndex(['modulo', 'status']);
        });

        Schema::table('instancias_coordinacion', function (Blueprint $table): void {
            $table->index(['padre_id', 'activo']);
            $table->index(['tipo', 'activo']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->index(['area_id', 'activo']);
        });

        Schema::table('permisos', function (Blueprint $table): void {
            $table->index(['modulo', 'activo']);
        });

        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table): void {
                $table->dropColumn('status');
            });
        }

        $this->restoreUniques();
    }

    private function dropUniques(): void
    {
        Schema::table('instancias_coordinacion', function (Blueprint $table): void {
            $table->dropUnique(['codigo']);
            $table->index('codigo');
        });

        Schema::table('cargos', function (Blueprint $table): void {
            $table->dropUnique(['nombre']);
            $table->index('nombre');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['usuario']);
            $table->dropUnique(['email']);
            $table->index('usuario');
            $table->index('email');
        });

        Schema::table('roles', function (Blueprint $table): void {
            $table->dropUnique(['clave']);
            $table->index('clave');
        });

        Schema::table('permisos', function (Blueprint $table): void {
            $table->dropUnique(['clave']);
            $table->index('clave');
        });
    }

    private function restoreUniques(): void
    {
        Schema::table('instancias_coordinacion', function (Blueprint $table): void {
            $table->dropIndex(['codigo']);
            $table->unique('codigo');
        });

        Schema::table('cargos', function (Blueprint $table): void {
            $table->dropIndex(['nombre']);
            $table->unique('nombre');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['usuario']);
            $table->dropIndex(['email']);
            $table->unique('usuario');
            $table->unique('email');
        });

        Schema::table('roles', function (Blueprint $table): void {
            $table->dropIndex(['clave']);
            $table->unique('clave');
        });

        Schema::table('permisos', function (Blueprint $table): void {
            $table->dropIndex(['clave']);
            $table->unique('clave');
        });
    }

    private function dropActivoIndexes(): void
    {
        Schema::table('instancias_coordinacion', function (Blueprint $table): void {
            $table->dropIndex(['padre_id', 'activo']);
            $table->dropIndex(['tipo', 'activo']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['area_id', 'activo']);
        });

        Schema::table('permisos', function (Blueprint $table): void {
            $table->dropIndex(['modulo', 'activo']);
        });
    }
};
