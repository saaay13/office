<?php

namespace App\Policies;

use App\Models\Cargo;
use App\Models\User;
use App\Support\Permisos;

class CargoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->tienePermiso(Permisos::CARGOS_VER);
    }

    public function view(User $user, Cargo $cargo): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->tienePermiso(Permisos::CARGOS_CREAR);
    }

    public function update(User $user, Cargo $cargo): bool
    {
        return $user->tienePermiso(Permisos::CARGOS_EDITAR);
    }

    public function delete(User $user, Cargo $cargo): bool
    {
        return $user->tienePermiso(Permisos::CARGOS_DESACTIVAR);
    }
}
