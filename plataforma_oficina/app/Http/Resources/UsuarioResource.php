<?php

namespace App\Http\Resources;

use App\Enums\StatusEntidad;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombres' => $this->nombres,
            'apellidos' => $this->apellidos,
            'nombre_completo' => $this->nombres.' '.$this->apellidos,
            'usuario' => $this->usuario,
            'email' => $this->email,
            'telefono' => $this->telefono,
            'status' => $this->status,
            'activo' => $this->status === StatusEntidad::Activo,
            'area_id' => $this->area_id,
            'rol_id' => $this->rol_id,
            'cargo_id' => $this->cargo_id,
            'ultimo_acceso_at' => $this->ultimo_acceso_at?->toISOString(),
            'area' => $this->whenLoaded('area', fn (): ?array => $this->area === null ? null : [
                'id' => $this->area->id,
                'nombre' => $this->area->nombre,
                'codigo' => $this->area->codigo,
            ]),
            'rol' => $this->whenLoaded('rol', fn (): ?array => $this->rol === null ? null : [
                'id' => $this->rol->id,
                'clave' => $this->rol->clave,
                'nombre' => $this->rol->nombre,
            ]),
            'cargo' => $this->whenLoaded('cargo', fn (): ?array => $this->cargo === null ? null : [
                'id' => $this->cargo->id,
                'nombre' => $this->cargo->nombre,
            ]),
        ];
    }
}
