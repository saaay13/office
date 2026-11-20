<?php

namespace App\Http\Resources;

use App\Enums\StatusEntidad;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'clave' => $this->clave,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'es_sistema' => $this->es_sistema,
            'status' => $this->status,
            'activo' => $this->status === StatusEntidad::Activo,
            'permisos' => $this->whenLoaded('permisos', fn (): array => $this->permisos->pluck('clave')->all()),
        ];
    }
}
