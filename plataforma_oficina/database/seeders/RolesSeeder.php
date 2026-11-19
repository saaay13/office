<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Support\Permisos;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        //los roles que se consideraron aun son - personal permiso para casi todo , encargado que seria de una area - el no tanto como jefe pero si masomenos
        // el jefe a diferencia de un personal solo seria ver personal no gestion - ver personal - veria igual el control de la productividad , despues seria un tipo administrador(vista) que igual ver nomas el controlaria 
        // igual solo esta trabajdo el area el personal de esa area y icluso en del jefe veris su productividad - y ya despues un admin - todo poderoso hace todo de todas la areas
        //seria para un peronal en caso de emergencias no algo asi , ahora el administrador(vista) podria ver de las area tegna que ver , diggas del hace de despacho bolque A , a pero tambien hay una Despacho Bloque B , estonces veria de ambas no  
        $nombres = [
            Permisos::ROL_ADMIN => 'Administrador institucional',
            Permisos::ROL_JEFE => 'Jefe de área',
            Permisos::ROL_FUNCIONARIO => 'Funcionario',
            Permisos::ROL_DIRECTIVO => 'Directivo',
            Permisos::ROL_AUDITOR => 'Auditor',
        ];

        foreach ($nombres as $clave => $nombre) {
            Rol::query()->updateOrCreate(
                ['clave' => $clave],
                [
                    'nombre' => $nombre,
                    'descripcion' => $nombre,
                    'es_sistema' => true,
                    'activo' => true,
                ]
            );
        }
    }
}
