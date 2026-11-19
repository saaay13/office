<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Umbrales de alerta
    |--------------------------------------------------------------------------
    |
    | Días de anticipación con los que un registro pasa de "en plazo" a
    | "por vencer". Antes de hoy se considera "vencido".
    |
    */

    'dias_por_vencer' => [
        'gestion' => 3,
        'novedad' => 1,
        'reunion' => 3,
        'coordinacion' => 3,
    ],

    /*
    |--------------------------------------------------------------------------
    | Coordinaciones
    |--------------------------------------------------------------------------
    |
    | Días de anticipación para marcar una coordinación "por coordinar" como
    | "revisar_coordinacion".
    |
    */

    'coordinacion_dias_revisar' => 2,

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),

];
