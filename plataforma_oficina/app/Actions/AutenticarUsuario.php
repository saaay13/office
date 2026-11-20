<?php

namespace App\Actions;

use App\Enums\StatusEntidad;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AutenticarUsuario
{
    public function execute(string $identificador, string $password): array
    {
        $usuario = User::query()
            ->where('usuario', $identificador)
            ->orWhere('email', $identificador)
            ->first();

        if ($usuario === null || ! Hash::check($password, $usuario->password)) {
            throw ValidationException::withMessages([
                'usuario' => trans('auth.failed'),
            ]);
        }

        if ($usuario->status !== StatusEntidad::Activo) {
            throw ValidationException::withMessages([
                'usuario' => 'El usuario está inactivo.',
            ]);
        }

        $usuario->forceFill(['ultimo_acceso_at' => now()])->save();

        return [
            'usuario' => $usuario->load('area', 'rol', 'cargo'),
            'token' => $usuario->createToken('plataforma-web')->plainTextToken,
        ];
    }
}
