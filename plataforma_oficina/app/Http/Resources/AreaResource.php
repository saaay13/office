<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AreaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'padre_id' => $this->padre_id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'tipo' => $this->tipo,
            'nivel' => $this->nivel,
            'ruta' => $this->ruta,
            'email' => $this->email,
            'telefono' => $this->telefono,
            'activo' => $this->activo,
            'padre' => $this->whenLoaded('padre', fn (): ?array => $this->padre === null ? null : [
                'id' => $this->padre->id,
                'nombre' => $this->padre->nombre,
                'codigo' => $this->padre->codigo,
            ]),
            'responsable' => $this->whenLoaded('responsable', fn (): ?array => $this->responsable === null ? null : [
                'id' => $this->responsable->id,
                'nombre' => $this->responsable->nombres.' '.$this->responsable->apellidos,
            ]),
        ];
    }
}
