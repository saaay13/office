<?php

namespace Database\Seeders;

use App\Enums\RolClave;
use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $nombres = [
            RolClave::AdminInstitucional->value => 'Administrador institucional',
            RolClave::JefeArea->value => 'Jefe de área',
            RolClave::Funcionario->value => 'Funcionario',
            RolClave::Directivo->value => 'Directivo',
            RolClave::Auditor->value => 'Auditor',
        ];

        foreach (RolClave::cases() as $clave) {
            Rol::query()->updateOrCreate(
                ['clave' => $clave->value],
                [
                    'nombre' => $nombres[$clave->value],
                    'descripcion' => $nombres[$clave->value],
                    'es_sistema' => true,
                    'activo' => true,
                ]
            );
        }
    }
}
