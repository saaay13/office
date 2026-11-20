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

    public function activar(User $user, Cargo $cargo): bool
    {
        return $user->tienePermiso(Permisos::CARGOS_DESACTIVAR);
    }

    public function desactivar(User $user, Cargo $cargo): bool
    {
        return $user->tienePermiso(Permisos::CARGOS_DESACTIVAR);
    }

    public function eliminar(User $user, Cargo $cargo): bool
    {
        return $user->tienePermiso(Permisos::CARGOS_ELIMINAR);
    }

    public function restaurar(User $user, Cargo $cargo): bool
    {
        return $user->tienePermiso(Permisos::CARGOS_RESTAURAR);
    }

    public function delete(User $user, Cargo $cargo): bool
    {
        return $this->eliminar($user, $cargo);
    }
}
