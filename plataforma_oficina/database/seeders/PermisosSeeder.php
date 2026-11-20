<?php

namespace Database\Seeders;

use App\Models\Permiso;
use App\Models\Rol;
use App\Support\Permisos;
use Illuminate\Database\Seeder;

class PermisosSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Permisos::catalogo() as $clave => $definicion) {
            Permiso::query()->updateOrCreate(
                ['clave' => $clave],
                [
                    'nombre' => $definicion['nombre'],
                    'modulo' => $definicion['modulo'],
                    'activo' => true,
                ]
            );
        }

        $ids = Permiso::query()
            ->whereIn('clave', array_keys(Permisos::catalogo()))
            ->pluck('id', 'clave');

        foreach (Permisos::ROLES as $clave) {
            $rol = Rol::query()->where('clave', $clave)->firstOrFail();
            $permisos = array_map(
                fn (string $permiso) => $ids[$permiso],
                Permisos::porRol($clave)
            );
            $rol->permisos()->sync($permisos);
        }
    }
}
