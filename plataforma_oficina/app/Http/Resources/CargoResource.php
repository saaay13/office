<?php

namespace App\Http\Resources;

use App\Enums\StatusEntidad;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CargoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'status' => $this->status,
            'activo' => $this->status === StatusEntidad::Activo,
        ];
    }
}
