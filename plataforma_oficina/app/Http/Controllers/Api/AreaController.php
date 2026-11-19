<?php

namespace App\Http\Controllers\Api;

use App\Actions\GuardarArea;
use App\Http\Controllers\Controller;
use App\Http\Requests\AreaRequest;
use App\Http\Resources\AreaResource;
use App\Models\InstanciaCoordinacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class AreaController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', InstanciaCoordinacion::class);

        $busqueda = $request->string('q')->toString();

        $areas = InstanciaCoordinacion::query()
            ->visiblesPara($request->user())
            ->when($busqueda !== '', function ($consulta) use ($busqueda): void {
                $consulta->where(function ($condicion) use ($busqueda): void {
                    $condicion->where('nombre', 'like', '%'.$busqueda.'%')
                        ->orWhere('codigo', 'like', '%'.$busqueda.'%');
                });
            })
            ->when($request->has('activo'), fn ($consulta) => $consulta->where('activo', $request->boolean('activo')))
            ->with(['padre:id,nombre,codigo', 'responsable:id,nombres,apellidos'])
            ->orderBy('ruta')
            ->orderBy('nombre')
            ->get();

        return AreaResource::collection($areas);
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
}
