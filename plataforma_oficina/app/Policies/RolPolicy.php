<?php

namespace App\Policies;

use App\Models\Rol;
use App\Models\User;
use App\Support\Permisos;

class RolPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->tienePermiso(Permisos::ROLES_VER);
    }

    public function view(User $user, Rol $rol): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->tienePermiso(Permisos::ROLES_CREAR);
    }

    public function update(User $user, Rol $rol): bool
    {
        return $user->tienePermiso(Permisos::ROLES_EDITAR);
    }

    public function delete(User $user, Rol $rol): bool
    {
        return $user->tienePermiso(Permisos::ROLES_DESACTIVAR);
    }
}
