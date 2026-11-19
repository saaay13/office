<?php

namespace App\Providers;

use App\Models\Mensaje;
use App\Models\Registro;
use App\Models\Reunion;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Relation::enforceMorphMap([
            'registro' => Registro::class,
            'reunion' => Reunion::class,
            'mensaje' => Mensaje::class,
        ]);
    }
}
