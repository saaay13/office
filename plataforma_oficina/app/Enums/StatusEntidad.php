<?php

namespace App\Enums;

enum StatusEntidad: string
{
    case Activo = 'activo';
    case Desactivado = 'desactivado';
    case Eliminado = 'eliminado';

    public function etiqueta(): string
    {
        return match ($this) {
            self::Activo => 'Activo',
            self::Desactivado => 'Desactivado',
            self::Eliminado => 'Eliminado',
        };
    }

    public function esActivo(): bool
    {
        return $this === self::Activo;
    }

    public function esEliminado(): bool
    {
        return $this === self::Eliminado;
    }
}
