<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PerfilRequest;
use App\Http\Resources\UsuarioResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PerfilController extends Controller
{
    public function show(Request $request): UsuarioResource
    {
        return new UsuarioResource($request->user()->load('area', 'rol', 'cargo'));
    }

    public function update(PerfilRequest $request): JsonResponse
    {
        $datos = $request->validated();

        if (isset($datos['password'])) {
            $datos['password'] = Hash::make($datos['password']);
        }

        $usuario = $request->user();
        $usuario->update($datos);

        return response()->json([
            'message' => 'Perfil actualizado.',
            'user' => new UsuarioResource($usuario->load('area', 'rol', 'cargo')),
        ]);
    }
}
