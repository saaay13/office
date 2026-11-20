<?php

use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CargoController;
use App\Http\Controllers\Api\OpcionesController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\PermisoController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:8,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:8,1');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/perfil', [PerfilController::class, 'show']);
    Route::put('/perfil', [PerfilController::class, 'update']);
    Route::get('/opciones', [OpcionesController::class, 'index']);

    Route::get('areas/arbol', [AreaController::class, 'arbol']);

    Route::post('areas/{area}/activar', [AreaController::class, 'activar']);
    Route::post('areas/{area}/desactivar', [AreaController::class, 'desactivar']);
    Route::post('areas/{area}/restaurar', [AreaController::class, 'restaurar']);

    Route::post('cargos/{cargo}/activar', [CargoController::class, 'activar']);
    Route::post('cargos/{cargo}/desactivar', [CargoController::class, 'desactivar']);
    Route::post('cargos/{cargo}/restaurar', [CargoController::class, 'restaurar']);

    Route::post('roles/{rol}/activar', [RolController::class, 'activar']);
    Route::post('roles/{rol}/desactivar', [RolController::class, 'desactivar']);
    Route::post('roles/{rol}/restaurar', [RolController::class, 'restaurar']);

    Route::post('permisos/{permiso}/activar', [PermisoController::class, 'activar']);
    Route::post('permisos/{permiso}/desactivar', [PermisoController::class, 'desactivar']);
    Route::post('permisos/{permiso}/restaurar', [PermisoController::class, 'restaurar']);

    Route::post('usuarios/{usuario}/activar', [UsuarioController::class, 'activar']);
    Route::post('usuarios/{usuario}/desactivar', [UsuarioController::class, 'desactivar']);
    Route::post('usuarios/{usuario}/restaurar', [UsuarioController::class, 'restaurar']);

    Route::apiResource('areas', AreaController::class);
    Route::apiResource('cargos', CargoController::class);
    Route::apiResource('roles', RolController::class)->parameters(['roles' => 'rol']);
    Route::apiResource('permisos', PermisoController::class);
    Route::apiResource('usuarios', UsuarioController::class);
});
