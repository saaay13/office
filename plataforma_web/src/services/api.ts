import type {
  Area,
  Cargo,
  Envelope,
  Opciones,
  ParametrosConsulta,
  Permiso,
  RespuestaAuth,
  RespuestaMensaje,
  RespuestaSesion,
  Rol,
  Usuario,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
const TOKEN_KEY = 'productividad.token'

type CuerpoRespuesta = {
  message?: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly errores: Record<string, string[]>

  constructor(mensaje: string, status: number, errores: Record<string, string[]> = {}) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.errores = errores
  }
}

export function leerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function guardarToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function borrarToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function solicitar<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const cabeceras = new Headers(opciones.headers)

  if (!cabeceras.has('Content-Type')) {
    cabeceras.set('Content-Type', 'application/json')
  }

  const token = leerToken()

  if (token) {
    cabeceras.set('Authorization', `Bearer ${token}`)
  }

  let respuesta: Response

  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, { ...opciones, headers: cabeceras })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0)
  }

  const cuerpo = await respuesta.json().catch((): CuerpoRespuesta => ({}))

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      borrarToken()
    }

    throw new ApiError(
      cuerpo.message ?? 'Ocurrió un error inesperado.',
      respuesta.status,
      cuerpo.errors ?? {},
    )
  }

  return cuerpo as T
}

function conParametros(ruta: string, parametros?: ParametrosConsulta): string {
  if (!parametros) {
    return ruta
  }

  const consulta = new URLSearchParams()

  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== '') {
      consulta.set(clave, String(valor))
    }
  })

  const texto = consulta.toString()

  return texto === '' ? ruta : `${ruta}?${texto}`
}

function recursos<T>(recurso: string) {
  return {
    listar: (parametros?: ParametrosConsulta): Promise<T[]> =>
      solicitar<Envelope<T[]>>(conParametros(`/${recurso}`, parametros)).then((respuesta) => respuesta.data),
    obtener: (id: number): Promise<T> =>
      solicitar<Envelope<T>>(`/${recurso}/${id}`).then((respuesta) => respuesta.data),
    crear: (datos: Record<string, unknown>): Promise<T> =>
      solicitar<Envelope<T>>(`/${recurso}`, { method: 'POST', body: JSON.stringify(datos) })
        .then((respuesta) => respuesta.data),
    actualizar: (id: number, datos: Record<string, unknown>): Promise<T> =>
      solicitar<Envelope<T>>(`/${recurso}/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
        .then((respuesta) => respuesta.data),
    desactivar: (id: number): Promise<RespuestaMensaje> =>
      solicitar<RespuestaMensaje>(`/${recurso}/${id}`, { method: 'DELETE' }),
  }
}

export const api = {
  auth: {
    login: (usuario: string, password: string): Promise<RespuestaAuth> =>
      solicitar<RespuestaAuth>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password }),
      }),
    me: (): Promise<RespuestaSesion> => solicitar<RespuestaSesion>('/auth/me'),
    logout: (): Promise<RespuestaMensaje> =>
      solicitar<RespuestaMensaje>('/auth/logout', { method: 'POST' }),
    forgotPassword: (email: string): Promise<RespuestaMensaje> =>
      solicitar<RespuestaMensaje>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (email: string, token: string, password: string): Promise<RespuestaMensaje> =>
      solicitar<RespuestaMensaje>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: password,
        }),
      }),
  },
  perfil: {
    obtener: (): Promise<Usuario> =>
      solicitar<Envelope<Usuario>>('/perfil').then((respuesta) => respuesta.data),
    actualizar: (datos: Partial<Usuario> & { password?: string }): Promise<{ message: string; user: Usuario }> =>
      solicitar<{ message: string; user: Usuario }>('/perfil', {
        method: 'PUT',
        body: JSON.stringify(datos),
      }),
  },
  opciones: (): Promise<Opciones> => solicitar<Opciones>('/opciones'),
  areas: recursos<Area>('areas'),
  cargos: recursos<Cargo>('cargos'),
  roles: recursos<Rol>('roles'),
  permisos: recursos<Permiso>('permisos'),
  usuarios: recursos<Usuario>('usuarios'),
}
