<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\InstanciaCoordinacion;
use App\Models\Rol;
use App\Models\User;
use App\Support\Permisos;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuariosSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Rol::query()->pluck('id', 'clave');
        $areas = InstanciaCoordinacion::query()->pluck('id', 'codigo');
        $cargos = Cargo::query()->pluck('id', 'nombre');

        $clavePrueba = (string) env('USUARIO_PASSWORD', '123456');
        $dominio = (string) env('CORREO_DOMINIO', 'tarija.gob.bo');

        $usuarios = [
            ['admin', 'Administrador', 'General', Permisos::ROL_ADMIN_GENERAL, 'DES', 'Administrador', 'admin@'.$dominio],
            ['jefe_a', 'Jefe', 'del Área A', Permisos::ROL_ENCARGADO, 'GAA', 'Director', 'jefe_a@'.$dominio],
            ['pa', 'Personal', 'A', Permisos::ROL_PERSONAL, 'GAA', 'Profesional', 'pa@'.$dominio],
            ['pa1', 'Personal', 'A1', Permisos::ROL_PERSONAL, 'GAA', 'Profesional', 'pa1@'.$dominio],
            ['pa2', 'Personal', 'A2', Permisos::ROL_PERSONAL, 'GAA', 'Técnico', 'pa2@'.$dominio],
            ['jefe_b', 'Jefe', 'del Área B', Permisos::ROL_ENCARGADO, 'CDAB', 'Director', 'jefe_b@'.$dominio],
            ['pb', 'Personal', 'B', Permisos::ROL_PERSONAL, 'CDAB', 'Profesional', 'pb@'.$dominio],
            ['pc', 'Personal', 'C', Permisos::ROL_PERSONAL, 'CDAB', 'Profesional', 'pc@'.$dominio],
            ['pc1', 'Personal', 'C1', Permisos::ROL_PERSONAL, 'CDAB', 'Técnico', 'pc1@'.$dominio],
            ['pc2', 'Personal', 'C2', Permisos::ROL_PERSONAL, 'CDAB', 'Técnico', 'pc2@'.$dominio],
            ['vista', 'Administrador', 'de Vista', Permisos::ROL_ADMIN_VISTA, 'DES', 'Analista', 'vista@'.$dominio],
            ['prueba', 'Usuario', 'de Prueba', Permisos::ROL_ADMIN_GENERAL, 'PRUEBA', 'Administrador', 'prueba@gmail.com'],
        ];

        foreach ($usuarios as [$usuario, $nombres, $apellidos, $rol, $area, $cargo, $email]) {
            User::query()->updateOrCreate(
                ['usuario' => $usuario],
                [
                    'rol_id' => $roles[$rol],
                    'area_id' => $areas[$area],
                    'cargo_id' => $cargos[$cargo] ?? null,
                    'nombres' => $nombres,
                    'apellidos' => $apellidos,
                    'email' => $email,
                    'password' => Hash::make($clavePrueba),
                    'activo' => true,
                ]
            );
        }

        $vista = User::query()->where('usuario', 'vista')->firstOrFail();
        $vista->areasAsignadas()->sync([
            $areas['GAA'] => ['activo' => true],
            $areas['CDAB'] => ['activo' => true],
        ]);

        InstanciaCoordinacion::query()->where('codigo', 'DES')
            ->update(['responsable_id' => User::query()->where('usuario', 'admin')->value('id')]);
        InstanciaCoordinacion::query()->where('codigo', 'GAA')
            ->update(['responsable_id' => User::query()->where('usuario', 'jefe_a')->value('id')]);
        InstanciaCoordinacion::query()->where('codigo', 'CDAB')
            ->update(['responsable_id' => User::query()->where('usuario', 'jefe_b')->value('id')]);
    }
}
