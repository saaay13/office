<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permisos;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->tienePermiso(Permisos::USUARIOS_VER);
    }

    public function view(User $user, User $destino): bool
    {
        return $user->tienePermiso(Permisos::USUARIOS_VER) || $user->id === $destino->id;
    }

    public function create(User $user): bool
    {
        return $user->tienePermiso(Permisos::USUARIOS_CREAR);
    }

    public function update(User $user, User $destino): bool
    {
        return $user->tienePermiso(Permisos::USUARIOS_EDITAR);
    }

    public function delete(User $user, User $destino): bool
    {
        return $user->tienePermiso(Permisos::USUARIOS_DESACTIVAR) && $user->id !== $destino->id;
    }
}
