<?php

namespace App\Support;

final class Permisos
{
    public const ROL_ADMIN = 'admin_institucional';
    public const ROL_JEFE = 'jefe_area';
    public const ROL_FUNCIONARIO = 'funcionario';
    public const ROL_DIRECTIVO = 'directivo';
    public const ROL_AUDITOR = 'auditor';

    public const TIPOS_AREA = ['despacho', 'secretaria', 'direccion', 'unidad', 'area'];

    public const AREAS_VER = 'areas.ver';
    public const AREAS_CREAR = 'areas.crear';
    public const AREAS_EDITAR = 'areas.editar';
    public const AREAS_DESACTIVAR = 'areas.desactivar';

    public const CARGOS_VER = 'cargos.ver';
    public const CARGOS_CREAR = 'cargos.crear';
    public const CARGOS_EDITAR = 'cargos.editar';
    public const CARGOS_DESACTIVAR = 'cargos.desactivar';

    public const ROLES_VER = 'roles.ver';
    public const ROLES_CREAR = 'roles.crear';
    public const ROLES_EDITAR = 'roles.editar';
    public const ROLES_DESACTIVAR = 'roles.desactivar';

    public const PERMISOS_VER = 'permisos.ver';
    public const PERMISOS_CREAR = 'permisos.crear';
    public const PERMISOS_EDITAR = 'permisos.editar';
    public const PERMISOS_DESACTIVAR = 'permisos.desactivar';

    public const USUARIOS_VER = 'usuarios.ver';
    public const USUARIOS_CREAR = 'usuarios.crear';
    public const USUARIOS_EDITAR = 'usuarios.editar';
    public const USUARIOS_DESACTIVAR = 'usuarios.desactivar';

    public const REGISTROS_VER = 'registros.ver';
    public const REGISTROS_CREAR = 'registros.crear';
    public const REGISTROS_EDITAR = 'registros.editar';
    public const REGISTROS_CERRAR = 'registros.cerrar';
    public const REGISTROS_COMPARTIR = 'registros.compartir';

    public const CATALOGOS_VER = 'catalogos.ver';
    public const CATALOGOS_CREAR = 'catalogos.crear';
    public const CATALOGOS_EDITAR = 'catalogos.editar';

    public const TIPOS_REGISTRO_CREAR = 'tipos_registro.crear';
    public const TIPOS_REGISTRO_EDITAR = 'tipos_registro.editar';

    public const ALERTAS_CREAR = 'alertas.crear';
    public const REPORTES_VER = 'reportes.ver';
    public const AUDITORIAS_VER = 'auditorias.ver';
    public const BITACORA_VER = 'bitacora.ver';
    public const CHAT_PARTICIPAR = 'chat.participar';

    public static function catalogo(): array
    {
        $grupos = [
            'organizacion' => [
                'areas.ver' => 'Ver áreas',
                'areas.crear' => 'Crear áreas',
                'areas.editar' => 'Editar áreas',
                'areas.desactivar' => 'Desactivar áreas',
                'cargos.ver' => 'Ver cargos',
                'cargos.crear' => 'Crear cargos',
                'cargos.editar' => 'Editar cargos',
                'cargos.desactivar' => 'Desactivar cargos',
                'roles.ver' => 'Ver roles',
                'roles.crear' => 'Crear roles',
                'roles.editar' => 'Editar roles',
                'roles.desactivar' => 'Desactivar roles',
                'permisos.ver' => 'Ver permisos',
                'permisos.crear' => 'Crear permisos',
                'permisos.editar' => 'Editar permisos',
                'permisos.desactivar' => 'Desactivar permisos',
                'usuarios.ver' => 'Ver usuarios',
                'usuarios.crear' => 'Crear usuarios',
                'usuarios.editar' => 'Editar usuarios',
                'usuarios.desactivar' => 'Desactivar usuarios',
            ],
            'operacion' => [
                'registros.ver' => 'Ver registros',
                'registros.crear' => 'Crear registros',
                'registros.editar' => 'Editar registros',
                'registros.cerrar' => 'Cerrar registros',
                'registros.compartir' => 'Compartir registros',
                'catalogos.ver' => 'Ver catálogos',
                'catalogos.crear' => 'Crear catálogos',
                'catalogos.editar' => 'Editar catálogos',
                'tipos_registro.crear' => 'Crear tipos de registro',
                'tipos_registro.editar' => 'Editar tipos de registro',
                'alertas.crear' => 'Crear reglas de alerta',
            ],
            'consulta' => [
                'reportes.ver' => 'Ver reportes',
                'auditorias.ver' => 'Ver auditorías',
                'bitacora.ver' => 'Ver bitácora de envíos',
                'chat.participar' => 'Participar en chat',
            ],
        ];

        $catalogo = [];

        foreach ($grupos as $modulo => $permisos) {
            foreach ($permisos as $clave => $nombre) {
                $catalogo[$clave] = ['nombre' => $nombre, 'modulo' => $modulo];
            }
        }

        return $catalogo;
    }

    public static function porRol(string $rol): array
    {
        $catalogo = array_keys(self::catalogo());

        return match ($rol) {
            self::ROL_ADMIN => $catalogo,
            self::ROL_JEFE => [
                self::AREAS_VER,
                self::AREAS_EDITAR,
                self::REGISTROS_VER,
                self::REGISTROS_CREAR,
                self::REGISTROS_EDITAR,
                self::REGISTROS_CERRAR,
                self::REGISTROS_COMPARTIR,
                self::CATALOGOS_VER,
                self::CATALOGOS_CREAR,
                self::CATALOGOS_EDITAR,
                self::TIPOS_REGISTRO_CREAR,
                self::TIPOS_REGISTRO_EDITAR,
                self::ALERTAS_CREAR,
                self::REPORTES_VER,
                self::AUDITORIAS_VER,
                self::BITACORA_VER,
                self::CHAT_PARTICIPAR,
            ],
            self::ROL_FUNCIONARIO => [
                self::AREAS_VER,
                self::REGISTROS_VER,
                self::REGISTROS_CREAR,
                self::REGISTROS_EDITAR,
                self::CHAT_PARTICIPAR,
            ],
            self::ROL_DIRECTIVO => [
                self::AREAS_VER,
                self::REPORTES_VER,
                self::CHAT_PARTICIPAR,
            ],
            self::ROL_AUDITOR => [
                self::AREAS_VER,
                self::REPORTES_VER,
                self::AUDITORIAS_VER,
                self::BITACORA_VER,
                self::CHAT_PARTICIPAR,
            ],
            default => [],
        };
    }
}
