export type Permiso = {
  id: number
  clave: string
  nombre: string
  modulo: string
  descripcion: string | null
  activo: boolean
}

export type Area = {
  id: number
  padre_id: number | null
  codigo: string | null
  nombre: string
  tipo: string | null
  nivel: number | null
  ruta: string | null
  email: string | null
  telefono: string | null
  activo: boolean
  responsable_id: number | null
  padre?: { id: number; nombre: string; codigo: string | null } | null
  responsable?: { id: number; nombre: string } | null
}

export type Cargo = {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export type Rol = {
  id: number
  clave: string
  nombre: string
  descripcion: string | null
  es_sistema: boolean
  activo: boolean
  permisos?: string[]
}

export type Usuario = {
  id: number
  nombres: string
  apellidos: string
  nombre_completo: string
  usuario: string
  email: string
  telefono: string | null
  activo: boolean
  area_id: number
  rol_id: number
  cargo_id: number | null
  ultimo_acceso_at: string | null
  area?: { id: number; nombre: string; codigo: string | null } | null
  rol?: { id: number; clave: string; nombre: string } | null
  cargo?: { id: number; nombre: string } | null
}

export type Opciones = {
  areas: Area[]
  cargos: Cargo[]
  roles: Rol[]
  permisos: Permiso[]
}

export type RespuestaAuth = {
  user: Usuario
  token: string
  permisos: string[]
}

export type RespuestaSesion = {
  user: Usuario
  permisos: string[]
}

export type Envelope<T> = {
  data: T
}

export type RespuestaMensaje = {
  message: string
}

export type ParametrosConsulta = Record<string, string | number | boolean | undefined>
