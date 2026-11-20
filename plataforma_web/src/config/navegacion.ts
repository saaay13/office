import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const ROLES = {
  personal: 'personal',
  encargado: 'encargado_area',
  adminVista: 'admin_vista',
  adminGeneral: 'admin_general',
} as const

export type RolClave = (typeof ROLES)[keyof typeof ROLES]

export type EnlaceNavegacion = {
  ruta: string
  texto: string
  descripcion: string
  icono: LucideIcon
  permisos?: string[]
  roles?: RolClave[]
}

export type GrupoNavegacion = {
  titulo: string
  enlaces: EnlaceNavegacion[]
}

export type PermisoConfiguracion = {
  clave: string
  nombre: string
  creacion: boolean
}

export const PERMISOS_CONFIGURACION: PermisoConfiguracion[] = [
  { clave: 'tipos_registro.crear', nombre: 'Crear tipos de registro', creacion: true },
  { clave: 'campos.crear', nombre: 'Crear campos', creacion: true },
  { clave: 'catalogos.crear', nombre: 'Crear catálogos', creacion: true },
  { clave: 'flujos.crear', nombre: 'Crear flujos', creacion: true },
  { clave: 'plantillas.crear', nombre: 'Crear plantillas', creacion: true },
  { clave: 'tipos_registro.editar', nombre: 'Editar tipos de registro', creacion: false },
  { clave: 'campos.editar', nombre: 'Editar campos', creacion: false },
  { clave: 'catalogos.editar', nombre: 'Editar catálogos', creacion: false },
  { clave: 'flujos.editar', nombre: 'Editar flujos', creacion: false },
  { clave: 'configuraciones.editar', nombre: 'Editar configuraciones', creacion: false },
]

export const CLAVES_CONFIGURACION_CREACION = PERMISOS_CONFIGURACION.filter(
  (permiso) => permiso.creacion,
).map((permiso) => permiso.clave)

const administradores = [ROLES.adminGeneral, ROLES.encargado] as RolClave[]

export const GRUPOS_NAVEGACION: GrupoNavegacion[] = [
  {
    titulo: 'Navegación principal',
    enlaces: [
      {
        ruta: '/',
        texto: 'Inicio',
        descripcion: 'Resumen general de la plataforma',
        icono: LayoutDashboard,
      },
      {
        ruta: '/reuniones',
        texto: 'Reuniones',
        descripcion: 'Agenda y seguimiento de reuniones',
        icono: CalendarDays,
        permisos: ['reuniones.ver'],
      },
      {
        ruta: '/secciones-de-trabajo',
        texto: 'Secciones de trabajo',
        descripcion: 'Tipos de registro habilitados para el área',
        icono: FolderOpen,
        permisos: ['registros.ver'],
      },
      {
        ruta: '/administrar-mi-area',
        texto: 'Administrar mi área',
        descripcion: 'Configuración operativa del área',
        icono: Settings2,
        permisos: CLAVES_CONFIGURACION_CREACION,
      },
      {
        ruta: '/perfil',
        texto: 'Mi perfil',
        descripcion: 'Datos personales y seguridad',
        icono: UserRound,
      },
    ],
  },
  {
    titulo: 'Administración',
    enlaces: [
      {
        ruta: '/areas',
        texto: 'Áreas',
        descripcion: 'Estructura organizacional',
        icono: Building2,
        permisos: ['areas.ver'],
        roles: administradores,
      },
      {
        ruta: '/cargos',
        texto: 'Cargos',
        descripcion: 'Catálogo institucional',
        icono: BriefcaseBusiness,
        permisos: ['cargos.ver'],
        roles: administradores,
      },
      {
        ruta: '/usuarios',
        texto: 'Usuarios',
        descripcion: 'Cuentas y asignaciones',
        icono: Users,
        permisos: ['usuarios.ver'],
        roles: administradores,
      },
      {
        ruta: '/roles',
        texto: 'Roles',
        descripcion: 'Perfiles de acceso',
        icono: ShieldCheck,
        permisos: ['roles.ver'],
        roles: [ROLES.adminGeneral],
      },
      {
        ruta: '/permisos',
        texto: 'Permisos',
        descripcion: 'Acciones del sistema',
        icono: KeyRound,
        permisos: ['permisos.ver'],
        roles: [ROLES.adminGeneral],
      },
    ],
  },
]

export const SECCIONES: Record<string, string> = Object.fromEntries(
  GRUPOS_NAVEGACION.flatMap((grupo) => grupo.enlaces).map((enlace) => [
    enlace.ruta,
    enlace.texto,
  ]),
)

export function enlaceVisible(
  enlace: EnlaceNavegacion,
  contexto: { rol: string | null; tienePermiso: (clave: string) => boolean },
): boolean {
  const permiteRol =
    enlace.roles === undefined ||
    (contexto.rol !== null && enlace.roles.includes(contexto.rol as RolClave))

  const permitePermiso =
    enlace.permisos === undefined || enlace.permisos.some(contexto.tienePermiso)

  return permiteRol && permitePermiso
}
