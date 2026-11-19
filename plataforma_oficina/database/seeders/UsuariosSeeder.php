<?php

namespace Database\Seeders;

use App\Enums\RolClave;
use App\Models\Cargo;
use App\Models\InstanciaCoordinacion;
use App\Models\Rol;
use App\Models\User;
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
            ['admin', 'Administrador', 'Institucional', RolClave::AdminInstitucional, 'DES', 'Administrador', $claveAdmin],
            ['jefe_a', 'Jefe', 'del Área A', RolClave::JefeArea, 'GAA', 'Director', $claveFuncionario],
            ['pa', 'Personal', 'A', RolClave::Funcionario, 'GAA', 'Profesional', $claveFuncionario],
            ['pa1', 'Personal', 'A1', RolClave::Funcionario, 'GAA', 'Profesional', $claveFuncionario],
            ['pa2', 'Personal', 'A2', RolClave::Funcionario, 'GAA', 'Técnico', $claveFuncionario],
            ['jefe_b', 'Jefe', 'del Área B', RolClave::JefeArea, 'CDAB', 'Director', $claveFuncionario],
            ['pb', 'Personal', 'B', RolClave::Funcionario, 'CDAB', 'Profesional', $claveFuncionario],
            ['pc', 'Personal', 'C', RolClave::Funcionario, 'CDAB', 'Profesional', $claveFuncionario],
            ['pc1', 'Personal', 'C1', RolClave::Funcionario, 'CDAB', 'Técnico', $claveFuncionario],
            ['pc2', 'Personal', 'C2', RolClave::Funcionario, 'CDAB', 'Técnico', $claveFuncionario],
        ];

        foreach ($usuarios as [$usuario, $nombres, $apellidos, $rol, $area, $cargo, $clave]) {
            User::query()->updateOrCreate(
                ['usuario' => $usuario],
                [
                    'rol_id' => $roles[$rol->value],
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
