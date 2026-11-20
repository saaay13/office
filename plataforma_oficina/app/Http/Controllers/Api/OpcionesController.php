<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AreaResource;
use App\Http\Resources\CargoResource;
use App\Http\Resources\PermisoResource;
use App\Http\Resources\RolResource;
use App\Models\Cargo;
use App\Models\InstanciaCoordinacion;
use App\Models\Permiso;
use App\Models\Rol;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpcionesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $areas = InstanciaCoordinacion::query()
            ->visiblesPara($request->user())
            ->activos()
            ->orderBy('ruta')
            ->orderBy('nombre')
            ->get();

        $cargos = Cargo::query()->activos()->orderBy('nombre')->get();
        $roles = Rol::query()->activos()->orderBy('nombre')->get();
        $permisos = Permiso::query()->activos()->orderBy('modulo')->orderBy('nombre')->get();

        return response()->json([
            'areas' => AreaResource::collection($areas)->resolve(),
            'cargos' => CargoResource::collection($cargos)->resolve(),
            'roles' => RolResource::collection($roles)->resolve(),
            'permisos' => PermisoResource::collection($permisos)->resolve(),
        ]);
    }
}
