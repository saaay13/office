<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if ($usuario !== null && ! $usuario->activo) {
            $usuario->currentAccessToken()?->delete();

            return response()->json(['message' => 'El usuario está inactivo.'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
