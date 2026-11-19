<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermisoRequest;
use App\Http\Resources\PermisoResource;
use App\Models\Permiso;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class PermisoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Permiso::class);

        $permisos = Permiso::query()
            ->when($request->filled('modulo'), fn ($consulta) => $consulta->where('modulo', $request->string('modulo')->toString()))
            ->when($request->has('activo'), fn ($consulta) => $consulta->where('activo', $request->boolean('activo')))
            ->orderBy('modulo')
            ->orderBy('nombre')
            ->get();

        return PermisoResource::collection($permisos);
    }

    public function store(PermisoRequest $request): JsonResponse
    {
        $permiso = Permiso::create($request->validated());

        return (new PermisoResource($permiso))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Permiso $permiso): PermisoResource
    {
        $this->authorize('view', $permiso);

        return new PermisoResource($permiso);
    }

    public function update(PermisoRequest $request, Permiso $permiso): PermisoResource
    {
        $permiso->update($request->validated());

        return new PermisoResource($permiso->refresh());
    }

    public function destroy(Permiso $permiso): JsonResponse
    {
        $this->authorize('delete', $permiso);
        $permiso->update(['activo' => false]);

        return response()->json(['message' => 'Permiso desactivado.']);
    }
}
