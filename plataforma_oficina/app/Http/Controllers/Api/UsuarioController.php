<?php

namespace App\Http\Controllers\Api;

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

        $usuarios = User::query()
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
            ->when($request->has('activo'), fn ($consulta) => $consulta->where('activo', $request->boolean('activo')))
            ->orderBy('apellidos')
            ->orderBy('nombres')
            ->get();

        return UsuarioResource::collection($usuarios);
    }

    public function store(UsuarioRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $datos['password'] = Hash::make($datos['password']);
        $datos['activo'] = $datos['activo'] ?? true;

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

    public function destroy(User $usuario): JsonResponse
    {
        $this->authorize('delete', $usuario);
        $usuario->update(['activo' => false]);
        $usuario->tokens()->delete();

        return response()->json(['message' => 'Usuario desactivado.']);
    }
}
