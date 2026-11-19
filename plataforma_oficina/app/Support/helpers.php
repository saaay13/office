<?php

use App\Models\InstanciaCoordinacion;
use Illuminate\Support\Carbon;

if (! function_exists('hoy')) {
    function hoy(): Carbon
    {
        return Carbon::now('America/La_Paz')->startOfDay();
    }
}

if (! function_exists('area_actual')) {
    function area_actual(): ?int
    {
        return auth()->user()?->area_id;
    }
}

if (! function_exists('puede')) {
    function puede(string $permiso, mixed $recurso = null): bool
    {
        $usuario = auth()->user();

        if ($usuario === null || ! $usuario->tienePermiso($permiso)) {
            return false;
        }

        if ($recurso instanceof InstanciaCoordinacion) {
            return $usuario->veArea($recurso);
        }

        return true;
    }
}
