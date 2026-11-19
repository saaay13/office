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

        $claveAdmin = (string) env('ADMIN_PASSWORD', 'Admin12345!');
        $claveFuncionario = (string) env('USUARIO_PASSWORD', 'Usuario12345!');
        $dominio = (string) env('CORREO_DOMINIO', 'tarija.gob.bo');

        $usuarios = [
            ['admin', 'Administrador', 'Institucional', Permisos::ROL_ADMIN, 'DES', 'Administrador', $claveAdmin],
            ['jefe_a', 'Jefe', 'del Área A', Permisos::ROL_JEFE, 'GAA', 'Director', $claveFuncionario],
            ['pa', 'Personal', 'A', Permisos::ROL_FUNCIONARIO, 'GAA', 'Profesional', $claveFuncionario],
            ['pa1', 'Personal', 'A1', Permisos::ROL_FUNCIONARIO, 'GAA', 'Profesional', $claveFuncionario],
            ['pa2', 'Personal', 'A2', Permisos::ROL_FUNCIONARIO, 'GAA', 'Técnico', $claveFuncionario],
            ['jefe_b', 'Jefe', 'del Área B', Permisos::ROL_JEFE, 'CDAB', 'Director', $claveFuncionario],
            ['pb', 'Personal', 'B', Permisos::ROL_FUNCIONARIO, 'CDAB', 'Profesional', $claveFuncionario],
            ['pc', 'Personal', 'C', Permisos::ROL_FUNCIONARIO, 'CDAB', 'Profesional', $claveFuncionario],
            ['pc1', 'Personal', 'C1', Permisos::ROL_FUNCIONARIO, 'CDAB', 'Técnico', $claveFuncionario],
            ['pc2', 'Personal', 'C2', Permisos::ROL_FUNCIONARIO, 'CDAB', 'Técnico', $claveFuncionario],
        ];

        foreach ($usuarios as [$usuario, $nombres, $apellidos, $rol, $area, $cargo, $clave]) {
            User::query()->updateOrCreate(
                ['usuario' => $usuario],
                [
                    'rol_id' => $roles[$rol],
                    'area_id' => $areas[$area],
                    'cargo_id' => $cargos[$cargo] ?? null,
                    'nombres' => $nombres,
                    'apellidos' => $apellidos,
                    'email' => $usuario.'@'.$dominio,
                    'password' => Hash::make($clave),
                    'activo' => true,
                ]
            );
        }

        InstanciaCoordinacion::query()->where('codigo', 'DES')
            ->update(['responsable_id' => User::query()->where('usuario', 'admin')->value('id')]);
        InstanciaCoordinacion::query()->where('codigo', 'GAA')
            ->update(['responsable_id' => User::query()->where('usuario', 'jefe_a')->value('id')]);
        InstanciaCoordinacion::query()->where('codigo', 'CDAB')
            ->update(['responsable_id' => User::query()->where('usuario', 'jefe_b')->value('id')]);
    }
}
