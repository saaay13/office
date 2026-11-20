<?php

namespace App\Policies;

use App\Models\InstanciaCoordinacion;
use App\Models\User;
use App\Support\Permisos;

class AreaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->tienePermiso(Permisos::AREAS_VER);
    }

    public function view(User $user, InstanciaCoordinacion $area): bool
    {
        return $user->tienePermiso(Permisos::AREAS_VER) && $user->veArea($area);
    }

    public function create(User $user): bool
    {
        return $user->tienePermiso(Permisos::AREAS_CREAR);
    }

    public function update(User $user, InstanciaCoordinacion $area): bool
    {
        return $user->tienePermiso(Permisos::AREAS_EDITAR) && $user->veArea($area);
    }

    public function activar(User $user, InstanciaCoordinacion $area): bool
    {
        return $user->tienePermiso(Permisos::AREAS_DESACTIVAR) && $user->veArea($area);
    }

    public function desactivar(User $user, InstanciaCoordinacion $area): bool
    {
        return $user->tienePermiso(Permisos::AREAS_DESACTIVAR) && $user->veArea($area);
    }

    public function eliminar(User $user, InstanciaCoordinacion $area): bool
    {
        return $user->tienePermiso(Permisos::AREAS_ELIMINAR) && $user->veArea($area);
    }

    public function restaurar(User $user, InstanciaCoordinacion $area): bool
    {
        return $user->tienePermiso(Permisos::AREAS_RESTAURAR) && $user->veArea($area);
    }

    public function delete(User $user, InstanciaCoordinacion $area): bool
    {
        return $this->eliminar($user, $area);
    }
}
