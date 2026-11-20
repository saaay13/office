<?php

namespace App\Http\Middleware;

use App\Enums\StatusEntidad;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if ($usuario !== null && $usuario->status !== StatusEntidad::Activo) {
            $usuario->currentAccessToken()?->delete();

            return response()->json(['message' => 'El usuario está inactivo.'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
