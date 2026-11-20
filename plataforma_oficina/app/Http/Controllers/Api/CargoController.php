<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusEntidad;
use App\Http\Controllers\Controller;
use App\Http\Requests\CargoRequest;
use App\Http\Resources\CargoResource;
use App\Models\Cargo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class CargoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Cargo::class);

        $busqueda = $request->string('q')->toString();

        $cargos = $this->aplicarFiltroStatus(
            Cargo::query()
                ->when($busqueda !== '', fn ($consulta) => $consulta->where('nombre', 'like', '%'.$busqueda.'%'))
                ->orderBy('nombre'),
            $request
        )->get();

        return CargoResource::collection($cargos);
    }

    public function store(CargoRequest $request): JsonResponse
    {
        $cargo = Cargo::create($request->validated());

        return (new CargoResource($cargo))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Cargo $cargo): CargoResource
    {
        $this->authorize('view', $cargo);

        return new CargoResource($cargo);
    }

    public function update(CargoRequest $request, Cargo $cargo): CargoResource
    {
        $cargo->update($request->validated());

        return new CargoResource($cargo->refresh());
    }

    public function activar(Cargo $cargo): JsonResponse
    {
        return $this->cambiarStatus(
            $cargo,
            'activar',
            StatusEntidad::Activo,
            [StatusEntidad::Desactivado],
            'Cargo activado.'
        );
    }

    public function desactivar(Cargo $cargo): JsonResponse
    {
        return $this->cambiarStatus(
            $cargo,
            'desactivar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Activo],
            'Cargo desactivado.'
        );
    }

    public function destroy(Cargo $cargo): JsonResponse
    {
        $this->authorize('eliminar', $cargo);

        if ($cargo->usuarios()->where('status', StatusEntidad::Activo->value)->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un cargo con usuarios activos asignados.',
            ], Response::HTTP_CONFLICT);
        }

        return $this->cambiarStatus(
            $cargo,
            'eliminar',
            StatusEntidad::Eliminado,
            [StatusEntidad::Activo, StatusEntidad::Desactivado],
            'Cargo eliminado.'
        );
    }

    public function restaurar(Cargo $cargo): JsonResponse
    {
        return $this->cambiarStatus(
            $cargo,
            'restaurar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Eliminado],
            'Cargo restaurado. Se encuentra desactivado.'
        );
    }
}
