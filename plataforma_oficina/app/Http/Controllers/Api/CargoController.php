<?php

namespace App\Http\Controllers\Api;

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

        $cargos = Cargo::query()
            ->when($busqueda !== '', fn ($consulta) => $consulta->where('nombre', 'like', '%'.$busqueda.'%'))
            ->when($request->has('activo'), fn ($consulta) => $consulta->where('activo', $request->boolean('activo')))
            ->orderBy('nombre')
            ->get();

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

    public function destroy(Cargo $cargo): JsonResponse
    {
        $this->authorize('delete', $cargo);
        $cargo->update(['activo' => false]);

        return response()->json(['message' => 'Cargo desactivado.']);
    }
}
