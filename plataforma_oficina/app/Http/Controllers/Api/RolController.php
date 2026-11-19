<?php

namespace App\Http\Controllers\Api;

use App\Actions\SincronizarPermisosRol;
use App\Http\Controllers\Controller;
use App\Http\Requests\RolRequest;
use App\Http\Resources\RolResource;
use App\Models\Rol;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class RolController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Rol::class);

        $roles = Rol::query()
            ->with('permisos:id,clave')
            ->when($request->has('activo'), fn ($consulta) => $consulta->where('activo', $request->boolean('activo')))
            ->orderBy('nombre')
            ->get();

        return RolResource::collection($roles);
    }

    public function store(RolRequest $request, SincronizarPermisosRol $sincronizar): JsonResponse
    {
        $datos = $request->validated();
        $permisos = $datos['permisos'] ?? [];
        unset($datos['permisos']);

        $rol = Rol::create($datos);
        $rol = $sincronizar->execute($rol, $permisos);

        return (new RolResource($rol))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Rol $rol): RolResource
    {
        $this->authorize('view', $rol);

        return new RolResource($rol->load('permisos'));
    }

    public function update(RolRequest $request, Rol $rol, SincronizarPermisosRol $sincronizar): RolResource
    {
        $datos = $request->validated();
        $rol->update(array_intersect_key($datos, array_flip(['nombre', 'descripcion', 'activo'])));

        if (array_key_exists('permisos', $datos)) {
            $rol = $sincronizar->execute($rol, $datos['permisos']);
        }

        return new RolResource($rol->load('permisos'));
    }

    public function destroy(Rol $rol): JsonResponse
    {
        $this->authorize('delete', $rol);

        if ($rol->es_sistema) {
            return response()->json([
                'message' => 'Los roles del sistema no se pueden desactivar.',
            ], Response::HTTP_CONFLICT);
        }

        $rol->update(['activo' => false]);

        return response()->json(['message' => 'Rol desactivado.']);
    }
}
