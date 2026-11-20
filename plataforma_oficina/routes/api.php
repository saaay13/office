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
    Route::apiResource('areas', AreaController::class);
    Route::apiResource('cargos', CargoController::class);
    Route::apiResource('roles', RolController::class)->parameters(['roles' => 'rol']);
    Route::apiResource('permisos', PermisoController::class);
    Route::apiResource('usuarios', UsuarioController::class);
});
