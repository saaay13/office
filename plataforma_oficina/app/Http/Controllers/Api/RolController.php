<?php

namespace App\Http\Controllers\Api;

use App\Actions\SincronizarPermisosRol;
use App\Enums\StatusEntidad;
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

        $roles = $this->aplicarFiltroStatus(
            Rol::query()->with('permisos:id,clave')->orderBy('nombre'),
            $request
        )->get();

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
        $rol->update(array_intersect_key($datos, array_flip(['nombre', 'descripcion'])));

        if (array_key_exists('permisos', $datos)) {
            $rol = $sincronizar->execute($rol, $datos['permisos']);
        }

        return new RolResource($rol->load('permisos'));
    }

    public function activar(Rol $rol): JsonResponse
    {
        if ($rol->es_sistema) {
            return $this->conflictoRolSistema('activar');
        }

        return $this->cambiarStatus(
            $rol,
            'activar',
            StatusEntidad::Activo,
            [StatusEntidad::Desactivado],
            'Rol activado.'
        );
    }

    public function desactivar(Rol $rol): JsonResponse
    {
        if ($rol->es_sistema) {
            return $this->conflictoRolSistema('desactivar');
        }

        return $this->cambiarStatus(
            $rol,
            'desactivar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Activo],
            'Rol desactivado.'
        );
    }

    public function destroy(Rol $rol): JsonResponse
    {
        if ($rol->es_sistema) {
            return $this->conflictoRolSistema('eliminar');
        }

        $this->authorize('eliminar', $rol);

        if ($rol->usuarios()->where('status', StatusEntidad::Activo->value)->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar un rol con usuarios activos asignados.',
            ], Response::HTTP_CONFLICT);
        }

        return $this->cambiarStatus(
            $rol,
            'eliminar',
            StatusEntidad::Eliminado,
            [StatusEntidad::Activo, StatusEntidad::Desactivado],
            'Rol eliminado.'
        );
    }

    public function restaurar(Rol $rol): JsonResponse
    {
        if ($rol->es_sistema) {
            return $this->conflictoRolSistema('restaurar');
        }

        return $this->cambiarStatus(
            $rol,
            'restaurar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Eliminado],
            'Rol restaurado. Se encuentra desactivado.'
        );
    }

    private function conflictoRolSistema(string $accion): JsonResponse
    {
        return response()->json([
            'message' => 'Los roles del sistema no se pueden '.$accion.'.',
        ], Response::HTTP_CONFLICT);
    }
}
