<?php

namespace App\Actions;

use App\Support\Permisos;
use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SincronizarPermisosRol
{
    public function execute(Rol $rol, array $permisos): Rol
    {
        if ($rol->clave === Permisos::ROL_ADMIN) {
            throw ValidationException::withMessages([
                'permisos' => 'Los permisos del administrador institucional no se pueden modificar.',
            ]);
        }

        return DB::transaction(function () use ($rol, $permisos): Rol {
            $ids = Permiso::query()
                ->whereIn('id', $permisos)
                ->where('activo', true)
                ->pluck('id')
                ->all();

            $rol->permisos()->sync($ids);

            return $rol->load('permisos');
        });
    }
}
