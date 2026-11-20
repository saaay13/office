<?php

namespace Database\Seeders;

use App\Models\Cargo;
use Illuminate\Database\Seeder;

class CargosSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Director', 'Administrador', 'Profesional', 'Técnico', 'Secretario', 'Analista'] as $nombre) {
            Cargo::query()->updateOrCreate(
                ['nombre' => $nombre],
                ['activo' => true]
            );
        }
    }
}
