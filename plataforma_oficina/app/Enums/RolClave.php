<?php

namespace App\Enums;

enum RolClave: string
{
    case AdminInstitucional = 'admin_institucional';
    case JefeArea = 'jefe_area';
    case Funcionario = 'funcionario';
    case Directivo = 'directivo';
    case Auditor = 'auditor';
}
