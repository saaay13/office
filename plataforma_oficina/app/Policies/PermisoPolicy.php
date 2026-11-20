<?php

namespace App\Policies;

use App\Models\Permiso;
use App\Models\User;
use App\Support\Permisos;

class PermisoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->tienePermiso(Permisos::PERMISOS_VER);
    }

    public function view(User $user, Permiso $permiso): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->tienePermiso(Permisos::PERMISOS_CREAR);
    }

    public function update(User $user, Permiso $permiso): bool
    {
        return $user->tienePermiso(Permisos::PERMISOS_EDITAR);
    }

    public function activar(User $user, Permiso $permiso): bool
    {
        return $user->tienePermiso(Permisos::PERMISOS_DESACTIVAR);
    }

    public function desactivar(User $user, Permiso $permiso): bool
    {
        return $user->tienePermiso(Permisos::PERMISOS_DESACTIVAR);
    }

    public function eliminar(User $user, Permiso $permiso): bool
    {
        return $user->tienePermiso(Permisos::PERMISOS_ELIMINAR);
    }

    public function restaurar(User $user, Permiso $permiso): bool
    {
        return $user->tienePermiso(Permisos::PERMISOS_RESTAURAR);
    }

    public function delete(User $user, Permiso $permiso): bool
    {
        return $this->eliminar($user, $permiso);
    }
}
