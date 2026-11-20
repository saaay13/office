<?php

namespace Database\Seeders;

use App\Enums\StatusEntidad;
use App\Models\Rol;
use App\Support\Permisos;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $nombres = [
            Permisos::ROL_PERSONAL => 'Personal',
            Permisos::ROL_ENCARGADO => 'Encargado de Área',
            Permisos::ROL_ADMIN_VISTA => 'Administrador de Vista',
            Permisos::ROL_ADMIN_GENERAL => 'Administrador General',
        ];

        foreach ($nombres as $clave => $nombre) {
            Rol::query()->updateOrCreate(
                ['clave' => $clave],
                [
                    'nombre' => $nombre,
                    'descripcion' => $nombre,
                    'es_sistema' => true,
                    'status' => StatusEntidad::Activo->value,
                ]
            );
        }
    }
}
