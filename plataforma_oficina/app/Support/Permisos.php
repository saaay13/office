<?php

namespace App\Support;

final class Permisos
{
    public const ROL_PERSONAL = 'personal';
    public const ROL_ENCARGADO = 'encargado_area';
    public const ROL_ADMIN_VISTA = 'admin_vista';
    public const ROL_ADMIN_GENERAL = 'admin_general';

    public const ROLES = [
        self::ROL_PERSONAL,
        self::ROL_ENCARGADO,
        self::ROL_ADMIN_VISTA,
        self::ROL_ADMIN_GENERAL,
    ];

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
    public const REGISTROS_EDITAR_COMPARTIDOS = 'registros.editar_compartidos';
    public const REGISTROS_CERRAR = 'registros.cerrar';
    public const REGISTROS_COMPARTIR = 'registros.compartir';
    public const REGISTROS_DESACTIVAR = 'registros.desactivar';

    public const TIPOS_REGISTRO_CREAR = 'tipos_registro.crear';
    public const TIPOS_REGISTRO_EDITAR = 'tipos_registro.editar';
    public const CAMPOS_CREAR = 'campos.crear';
    public const CAMPOS_EDITAR = 'campos.editar';
    public const CATALOGOS_CREAR = 'catalogos.crear';
    public const CATALOGOS_EDITAR = 'catalogos.editar';
    public const FLUJOS_CREAR = 'flujos.crear';
    public const FLUJOS_EDITAR = 'flujos.editar';
    public const PLANTILLAS_CREAR = 'plantillas.crear';

    public const ADJUNTOS_SUBIR = 'adjuntos.subir';
    public const ADJUNTOS_DESCARGAR = 'adjuntos.descargar';

    public const REUNIONES_VER = 'reuniones.ver';
    public const REUNIONES_CREAR = 'reuniones.crear';
    public const REUNIONES_EDITAR = 'reuniones.editar';

    public const COMPARTICIONES_SOLICITAR = 'comparticiones.solicitar';
    public const COMPARTICIONES_ACEPTAR = 'comparticiones.aceptar';
    public const COMPARTICIONES_AUTORIZAR = 'comparticiones.autorizar';
    public const ASIGNACIONES_ACEPTAR = 'asignaciones.aceptar';

    public const ALERTAS_CREAR = 'alertas.crear';
    public const ALERTAS_VISUAL_CREAR = 'alertas.visual.crear';
    public const NOTIFICACIONES_BITACORA_VER = 'notificaciones.bitacora.ver';
    public const CONFIGURACIONES_EDITAR = 'configuraciones.editar';

    public const REPORTES_VER = 'reportes.ver';
    public const REPORTES_EXPORTAR = 'reportes.exportar';
    public const AUDITORIAS_VER = 'auditorias.ver';
    public const CHAT_PARTICIPAR = 'chat.participar';

    public static function catalogo(): array
    {
        $grupos = [
            'organizacion' => [
                self::AREAS_VER => 'Ver áreas',
                self::AREAS_CREAR => 'Crear áreas',
                self::AREAS_EDITAR => 'Editar áreas',
                self::AREAS_DESACTIVAR => 'Desactivar áreas',
                self::CARGOS_VER => 'Ver cargos',
                self::CARGOS_CREAR => 'Crear cargos',
                self::CARGOS_EDITAR => 'Editar cargos',
                self::CARGOS_DESACTIVAR => 'Desactivar cargos',
                self::ROLES_VER => 'Ver roles',
                self::ROLES_CREAR => 'Crear roles',
                self::ROLES_EDITAR => 'Editar roles',
                self::ROLES_DESACTIVAR => 'Desactivar roles',
                self::PERMISOS_VER => 'Ver permisos',
                self::PERMISOS_CREAR => 'Crear permisos',
                self::PERMISOS_EDITAR => 'Editar permisos',
                self::PERMISOS_DESACTIVAR => 'Desactivar permisos',
                self::USUARIOS_VER => 'Ver usuarios',
                self::USUARIOS_CREAR => 'Crear usuarios',
                self::USUARIOS_EDITAR => 'Editar usuarios',
                self::USUARIOS_DESACTIVAR => 'Desactivar usuarios',
            ],
            'operacion' => [
                self::REGISTROS_VER => 'Ver registros',
                self::REGISTROS_CREAR => 'Crear registros',
                self::REGISTROS_EDITAR => 'Editar registros',
                self::REGISTROS_EDITAR_COMPARTIDOS => 'Editar registros compartidos',
                self::REGISTROS_CERRAR => 'Cerrar registros',
                self::REGISTROS_COMPARTIR => 'Compartir registros',
                self::REGISTROS_DESACTIVAR => 'Desactivar registros',
            ],
            'configuracion' => [
                self::TIPOS_REGISTRO_CREAR => 'Crear tipos de registro',
                self::TIPOS_REGISTRO_EDITAR => 'Editar tipos de registro',
                self::CAMPOS_CREAR => 'Crear campos',
                self::CAMPOS_EDITAR => 'Editar campos',
                self::CATALOGOS_CREAR => 'Crear catálogos',
                self::CATALOGOS_EDITAR => 'Editar catálogos',
                self::FLUJOS_CREAR => 'Crear flujos',
                self::FLUJOS_EDITAR => 'Editar flujos',
                self::PLANTILLAS_CREAR => 'Crear plantillas',
            ],
            'evidencia' => [
                self::ADJUNTOS_SUBIR => 'Subir adjuntos',
                self::ADJUNTOS_DESCARGAR => 'Descargar adjuntos',
                self::AUDITORIAS_VER => 'Ver auditorías',
            ],
            'reuniones' => [
                self::REUNIONES_VER => 'Ver reuniones',
                self::REUNIONES_CREAR => 'Crear reuniones',
                self::REUNIONES_EDITAR => 'Editar reuniones',
            ],
            'comparticion' => [
                self::COMPARTICIONES_SOLICITAR => 'Solicitar compartición',
                self::COMPARTICIONES_ACEPTAR => 'Aceptar compartición',
                self::COMPARTICIONES_AUTORIZAR => 'Autorizar compartición',
                self::ASIGNACIONES_ACEPTAR => 'Aceptar asignaciones',
            ],
            'alertas' => [
                self::ALERTAS_CREAR => 'Crear reglas de alerta',
                self::ALERTAS_VISUAL_CREAR => 'Crear reglas visuales',
                self::NOTIFICACIONES_BITACORA_VER => 'Ver bitácora de envíos',
                self::CONFIGURACIONES_EDITAR => 'Editar configuraciones',
            ],
            'consulta' => [
                self::REPORTES_VER => 'Ver reportes',
                self::REPORTES_EXPORTAR => 'Exportar reportes',
                self::CHAT_PARTICIPAR => 'Participar en chat',
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
            self::ROL_ADMIN_GENERAL => $catalogo,
            self::ROL_ENCARGADO => [
                self::AREAS_VER,
                self::CARGOS_VER,
                self::USUARIOS_VER,
                self::USUARIOS_CREAR,
                self::USUARIOS_EDITAR,
                self::USUARIOS_DESACTIVAR,
                self::REGISTROS_VER,
                self::REGISTROS_CREAR,
                self::REGISTROS_EDITAR,
                self::REGISTROS_EDITAR_COMPARTIDOS,
                self::REGISTROS_CERRAR,
                self::REGISTROS_COMPARTIR,
                self::REGISTROS_DESACTIVAR,
                self::TIPOS_REGISTRO_CREAR,
                self::TIPOS_REGISTRO_EDITAR,
                self::CAMPOS_CREAR,
                self::CAMPOS_EDITAR,
                self::CATALOGOS_CREAR,
                self::CATALOGOS_EDITAR,
                self::FLUJOS_CREAR,
                self::FLUJOS_EDITAR,
                self::ADJUNTOS_SUBIR,
                self::ADJUNTOS_DESCARGAR,
                self::AUDITORIAS_VER,
                self::REUNIONES_VER,
                self::REUNIONES_CREAR,
                self::REUNIONES_EDITAR,
                self::COMPARTICIONES_SOLICITAR,
                self::COMPARTICIONES_ACEPTAR,
                self::COMPARTICIONES_AUTORIZAR,
                self::ASIGNACIONES_ACEPTAR,
                self::ALERTAS_CREAR,
                self::ALERTAS_VISUAL_CREAR,
                self::NOTIFICACIONES_BITACORA_VER,
                self::REPORTES_VER,
                self::REPORTES_EXPORTAR,
                self::CHAT_PARTICIPAR,
            ],
            self::ROL_PERSONAL => [
                self::AREAS_VER,
                self::REGISTROS_VER,
                self::REGISTROS_CREAR,
                self::REGISTROS_EDITAR,
                self::REGISTROS_COMPARTIR,
                self::ADJUNTOS_SUBIR,
                self::ADJUNTOS_DESCARGAR,
                self::REUNIONES_VER,
                self::COMPARTICIONES_SOLICITAR,
                self::COMPARTICIONES_ACEPTAR,
                self::ASIGNACIONES_ACEPTAR,
                self::CHAT_PARTICIPAR,
            ],
            self::ROL_ADMIN_VISTA => [
                self::AREAS_VER,
                self::USUARIOS_VER,
                self::REGISTROS_VER,
                self::ADJUNTOS_DESCARGAR,
                self::AUDITORIAS_VER,
                self::REUNIONES_VER,
                self::NOTIFICACIONES_BITACORA_VER,
                self::REPORTES_VER,
                self::REPORTES_EXPORTAR,
                self::CHAT_PARTICIPAR,
            ],
            default => [],
        };
    }
}
