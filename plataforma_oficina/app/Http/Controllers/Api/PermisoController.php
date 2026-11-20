<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusEntidad;
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

        $permisos = $this->aplicarFiltroStatus(
            Permiso::query()
                ->when($request->filled('modulo'), fn ($consulta) => $consulta->where('modulo', $request->string('modulo')->toString()))
                ->orderBy('modulo')
                ->orderBy('nombre'),
            $request
        )->get();

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

    public function activar(Permiso $permiso): JsonResponse
    {
        return $this->cambiarStatus(
            $permiso,
            'activar',
            StatusEntidad::Activo,
            [StatusEntidad::Desactivado],
            'Permiso activado.'
        );
    }

    public function desactivar(Permiso $permiso): JsonResponse
    {
        return $this->cambiarStatus(
            $permiso,
            'desactivar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Activo],
            'Permiso desactivado.'
        );
    }

    public function destroy(Permiso $permiso): JsonResponse
    {
        $this->authorize('eliminar', $permiso);

        $rolesVigentes = $permiso->roles()
            ->where('roles.status', '!=', StatusEntidad::Eliminado->value)
            ->exists();

        if ($rolesVigentes) {
            return response()->json([
                'message' => 'No se puede eliminar un permiso asignado a roles vigentes.',
            ], Response::HTTP_CONFLICT);
        }

        return $this->cambiarStatus(
            $permiso,
            'eliminar',
            StatusEntidad::Eliminado,
            [StatusEntidad::Activo, StatusEntidad::Desactivado],
            'Permiso eliminado.'
        );
    }

    public function restaurar(Permiso $permiso): JsonResponse
    {
        return $this->cambiarStatus(
            $permiso,
            'restaurar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Eliminado],
            'Permiso restaurado. Se encuentra desactivado.'
        );
    }
}
