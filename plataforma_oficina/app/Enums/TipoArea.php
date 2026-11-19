<?php

namespace App\Enums;

enum TipoArea: string
{
    case Despacho = 'despacho';
    case Secretaria = 'secretaria';
    case Direccion = 'direccion';
    case Unidad = 'unidad';
    case Area = 'area';
}
