<?php

namespace App\Http\Controllers\Api;

use App\Actions\ConstruirArbolAreas;
use App\Actions\GuardarArea;
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

    public function destroy(Request $request, InstanciaCoordinacion $area): JsonResponse
    {
        $this->authorize('delete', $area);

        if ($area->hijos()->where('activo', true)->exists()) {
            return response()->json([
                'message' => 'No se puede desactivar un área con áreas hijas activas.',
            ], Response::HTTP_CONFLICT);
        }

        $area->update(['activo' => false]);

        return response()->json(['message' => 'Área desactivada.']);
    }

    private function consultaVisible(Request $request): Builder
    {
        $busqueda = $request->string('q')->toString();

        return InstanciaCoordinacion::query()
            ->visiblesPara($request->user())
            ->when($busqueda !== '', function (Builder $consulta) use ($busqueda): void {
                $consulta->where(function (Builder $condicion) use ($busqueda): void {
                    $condicion->where('nombre', 'like', '%'.$busqueda.'%')
                        ->orWhere('codigo', 'like', '%'.$busqueda.'%');
                });
            })
            ->when($request->has('activo'), fn (Builder $consulta) => $consulta->where('activo', $request->boolean('activo')))
            ->when($request->filled('tipo'), fn (Builder $consulta) => $consulta->where('tipo', $request->string('tipo')->toString()))
            ->with(['padre:id,nombre,codigo', 'responsable:id,nombres,apellidos'])
            ->orderBy('ruta')
            ->orderBy('nombre');
    }
}
