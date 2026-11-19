<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            PermisosSeeder::class,
            CargosSeeder::class,
            AreasSeeder::class,
            UsuariosSeeder::class,
        ]);
    }
}
