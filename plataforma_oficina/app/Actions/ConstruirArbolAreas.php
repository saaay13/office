<?php

namespace App\Actions;

use App\Http\Resources\AreaResource;
use App\Models\InstanciaCoordinacion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class ConstruirArbolAreas
{
    public function execute(Collection $areas, Request $peticion): array
    {
        $ids = $areas->pluck('id');

        return $areas
            ->filter(fn (InstanciaCoordinacion $area): bool =>
                $area->padre_id === null || ! $ids->contains($area->padre_id))
            ->sortBy('nombre')
            ->map(fn (InstanciaCoordinacion $area): array => $this->nodo($area, $areas, $peticion))
            ->values()
            ->all();
    }

    private function nodo(InstanciaCoordinacion $area, Collection $areas, Request $peticion): array
    {
        $datos = (new AreaResource($area))->resolve($peticion);
        $datos['hijos'] = $areas
            ->where('padre_id', $area->id)
            ->sortBy('nombre')
            ->map(fn (InstanciaCoordinacion $hijo): array => $this->nodo($hijo, $areas, $peticion))
            ->values()
            ->all();

        return $datos;
    }
}
