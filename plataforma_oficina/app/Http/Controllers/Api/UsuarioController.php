<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusEntidad;
use App\Http\Controllers\Controller;
use App\Http\Requests\UsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class UsuarioController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $busqueda = $request->string('q')->toString();

        $usuarios = $this->aplicarFiltroStatus(
            User::query()
                ->with('area:id,nombre,codigo', 'rol:id,clave,nombre', 'cargo:id,nombre')
                ->when($busqueda !== '', function ($consulta) use ($busqueda): void {
                    $consulta->where(function ($condicion) use ($busqueda): void {
                        $condicion->where('nombres', 'like', '%'.$busqueda.'%')
                            ->orWhere('apellidos', 'like', '%'.$busqueda.'%')
                            ->orWhere('usuario', 'like', '%'.$busqueda.'%')
                            ->orWhere('email', 'like', '%'.$busqueda.'%');
                    });
                })
                ->when($request->filled('area_id'), fn ($consulta) => $consulta->where('area_id', $request->integer('area_id')))
                ->when($request->filled('rol_id'), fn ($consulta) => $consulta->where('rol_id', $request->integer('rol_id')))
                ->orderBy('apellidos')
                ->orderBy('nombres'),
            $request
        )->get();

        return UsuarioResource::collection($usuarios);
    }

    public function store(UsuarioRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $datos['password'] = Hash::make($datos['password']);
        $datos['status'] = $datos['status'] ?? StatusEntidad::Activo->value;

        $usuario = User::create($datos);

        return (new UsuarioResource($usuario->load('area', 'rol', 'cargo')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(User $usuario): UsuarioResource
    {
        $this->authorize('view', $usuario);

        return new UsuarioResource($usuario->load('area', 'rol', 'cargo'));
    }

    public function update(UsuarioRequest $request, User $usuario): UsuarioResource
    {
        $datos = $request->validated();

        if (isset($datos['password'])) {
            $datos['password'] = Hash::make($datos['password']);
        }

        $usuario->update($datos);

        return new UsuarioResource($usuario->load('area', 'rol', 'cargo'));
    }

    public function activar(User $usuario): JsonResponse
    {
        return $this->cambiarStatus(
            $usuario,
            'activar',
            StatusEntidad::Activo,
            [StatusEntidad::Desactivado],
            'Usuario activado.'
        );
    }

    public function desactivar(User $usuario): JsonResponse
    {
        return $this->cambiarStatus(
            $usuario,
            'desactivar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Activo],
            'Usuario desactivado.'
        );
    }

    public function destroy(User $usuario): JsonResponse
    {
        $this->authorize('eliminar', $usuario);

        if (! in_array($usuario->status, [StatusEntidad::Activo, StatusEntidad::Desactivado], true)) {
            return response()->json([
                'message' => 'La transición de estado no es válida.',
            ], Response::HTTP_CONFLICT);
        }

        $usuario->update(['status' => StatusEntidad::Eliminado]);
        $usuario->tokens()->delete();

        return response()->json(['message' => 'Usuario eliminado.']);
    }

    public function restaurar(User $usuario): JsonResponse
    {
        return $this->cambiarStatus(
            $usuario,
            'restaurar',
            StatusEntidad::Desactivado,
            [StatusEntidad::Eliminado],
            'Usuario restaurado. Se encuentra desactivado.'
        );
    }
}
