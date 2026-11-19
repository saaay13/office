<?php

namespace App\Http\Controllers\Api;

use App\Actions\AutenticarUsuario;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function login(LoginRequest $request, AutenticarUsuario $autenticar): JsonResponse
    {
        $resultado = $autenticar->execute(
            $request->string('usuario')->toString(),
            $request->string('password')->toString()
        );

        return response()->json([
            'user' => new UsuarioResource($resultado['usuario']),
            'token' => $resultado['token'],
            'permisos' => $resultado['usuario']->permisos()->pluck('clave')->all(),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $usuario = $request->user()->load('area', 'rol', 'cargo');

        return response()->json([
            'user' => new UsuarioResource($usuario),
            'permisos' => $usuario->permisos()->pluck('clave')->all(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        Password::broker()->sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'Si el correo está registrado, se envió un enlace para restablecer la contraseña.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $estado = Password::broker()->reset($request->only('email', 'password', 'token'), function (User $usuario, string $password): void {
            $usuario->forceFill(['password' => Hash::make($password)])->save();
        });

        if ($estado !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'No se pudo restablecer la contraseña.',
                'errors' => ['email' => [trans($estado)]],
            ], 422);
        }

        return response()->json(['message' => 'Contraseña actualizada. Puede iniciar sesión.']);
    }
}
