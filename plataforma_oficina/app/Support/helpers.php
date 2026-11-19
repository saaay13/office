<?php

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
