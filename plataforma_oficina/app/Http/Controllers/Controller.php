<?php

namespace App\Http\Controllers;

use App\Enums\StatusEntidad;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class Controller
{
    use AuthorizesRequests;

    protected function aplicarFiltroStatus(Builder $consulta, Request $request): Builder
    {
        $status = $request->query('status');
        $valores = array_column(StatusEntidad::cases(), 'value');

        if (is_string($status) && in_array($status, $valores, true)) {
            return $consulta->where('status', $status);
        }

        if ($request->has('activo')) {
            return $consulta->where('status', $request->boolean('activo')
                ? StatusEntidad::Activo->value
                : StatusEntidad::Desactivado->value);
        }

        return $consulta->where('status', StatusEntidad::Activo->value);
    }

    /**
     * @param list<StatusEntidad> $origenes
     */
    protected function cambiarStatus(
        Model $modelo,
        string $ability,
        StatusEntidad $destino,
        array $origenes,
        string $mensaje
    ): JsonResponse {
        $this->authorize($ability, $modelo);

        if (! in_array($modelo->status, $origenes, true)) {
            return response()->json([
                'message' => 'La transición de estado no es válida.',
            ], Response::HTTP_CONFLICT);
        }

        $modelo->update(['status' => $destino]);

        return response()->json(['message' => $mensaje]);
    }
}
