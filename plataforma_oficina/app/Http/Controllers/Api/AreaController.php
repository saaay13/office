<?php

namespace App\Http\Controllers\Api;

use App\Actions\ConstruirArbolAreas;
use App\Actions\GuardarArea;
use App\Enums\StatusEntidad;
use App\Http\Controllers\Controller;
use App\Http\Requests\AreaRequest;
use App\Http\Resources\AreaResource;
use App\Models\InstanciaCoordinacion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class AreaController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', InstanciaCoordinacion::class);

        $areas = $this->consultaVisible($request)->get();

        return AreaResource::collection($areas);
    }

    public function arbol(Request $request, ConstruirArbolAreas $construir): JsonResponse
    {
        $this->authorize('viewAny', InstanciaCoordinacion::class);

        $areas = $this->consultaVisible($request)->get();

        return response()->json(['data' => $construir->execute($areas, $request)]);
    }

    public function store(AreaRequest $request, GuardarArea $guardar): JsonResponse
    {
        $area = $guardar->execute($request->validated());

        return (new AreaResource($area))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, InstanciaCoordinacion $area): AreaResource
    {
        $this->authorize('view', $area);

        return new AreaResource($area->load('padre', 'responsable'));
    }

    public function update(AreaRequest $request, InstanciaCoordinacion $area, GuardarArea $guardar): AreaResource
    {
        return new AreaResource($guardar->execute($request->validated(), $area));
    }

    public function activar(InstanciaCoordinacion $area): JsonResponse
    {
        return $this->cambiarStatus(
            $area,
            'activar',
            StatusEntidad::Activo,
            [StatusEntidad::Desactivado],
            'Área activada.'
        );
    }

    public function desactivar(InstanciaCoordinacion $area): JsonResponse
    {
        $this->authorize('desactivar', $area);

        if ($area->hijos()->where('status', StatusEntidad::Activo->value)->exists()) {
            return response()->json([
                'message' => 'No se puede desactivar un área con áreas hijas activas.',
            ], Response::HTTP_CONFLICT);
        }

        return $this->cambiarStatus(
            $area,
            'desactivar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Activo],
            'Área desactivada.'
        );
    }

    public function destroy(InstanciaCoordinacion $area): JsonResponse
    {
        $this->authorize('eliminar', $area);

        if ($area->hijos()->where('status', '!=', StatusEntidad::Eliminado->value)->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un área con áreas hijas vigentes.',
            ], Response::HTTP_CONFLICT);
        }

        if ($area->usuarios()->where('status', StatusEntidad::Activo->value)->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un área con usuarios activos asignados.',
            ], Response::HTTP_CONFLICT);
        }

        return $this->cambiarStatus(
            $area,
            'eliminar',
            StatusEntidad::Eliminado,
            [StatusEntidad::Activo, StatusEntidad::Desactivado],
            'Área eliminada.'
        );
    }

    public function restaurar(InstanciaCoordinacion $area): JsonResponse
    {
        $this->authorize('restaurar', $area);

        if ($area->padre?->status === StatusEntidad::Eliminado) {
            return response()->json([
                'message' => 'No se puede restaurar un área cuyo padre está eliminado.',
            ], Response::HTTP_CONFLICT);
        }

        return $this->cambiarStatus(
            $area,
            'restaurar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Eliminado],
            'Área restaurada. Se encuentra desactivada.'
        );
    }

    private function consultaVisible(Request $request): Builder
    {
        $busqueda = $request->string('q')->toString();

        return $this->aplicarFiltroStatus(
            InstanciaCoordinacion::query()
                ->visiblesPara($request->user())
                ->when($busqueda !== '', function (Builder $consulta) use ($busqueda): void {
                    $consulta->where(function (Builder $condicion) use ($busqueda): void {
                        $condicion->where('nombre', 'like', '%'.$busqueda.'%')
                            ->orWhere('codigo', 'like', '%'.$busqueda.'%');
                    });
                })
                ->when($request->filled('tipo'), fn (Builder $consulta) => $consulta->where('tipo', $request->string('tipo')->toString()))
                ->with(['padre:id,nombre,codigo', 'responsable:id,nombres,apellidos'])
                ->orderBy('ruta')
                ->orderBy('nombre'),
            $request
        );
    }
}
