import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, borrarToken, guardarToken, leerToken } from '../services/api'
import type { Usuario } from '../types'

type AuthContextValue = {
  usuario: Usuario | null
  permisos: string[]
  cargando: boolean
  tienePermiso: (clave: string) => boolean
  iniciarSesion: (usuario: string, password: string) => Promise<void>
  cerrarSesion: () => Promise<void>
  fijarUsuario: (usuario: Usuario) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [permisos, setPermisos] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true

    async function restaurarSesion(): Promise<void> {
      if (leerToken() === null) {
        if (activo) {
          setCargando(false)
        }

        return
      }

      try {
        const sesion = await api.auth.me()

        if (activo) {
          setUsuario(sesion.user)
          setPermisos(sesion.permisos)
        }
      } catch {
        borrarToken()
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    void restaurarSesion()

    return () => {
      activo = false
    }
  }, [])

  const tienePermiso = useCallback(
    (clave: string): boolean => permisos.includes(clave),
    [permisos],
  )

  const iniciarSesion = useCallback(async (nombre: string, password: string): Promise<void> => {
    const respuesta = await api.auth.login(nombre, password)

    guardarToken(respuesta.token)
    setUsuario(respuesta.user)
    setPermisos(respuesta.permisos)
  }, [])

  const cerrarSesion = useCallback(async (): Promise<void> => {
    try {
      await api.auth.logout()
    } finally {
      borrarToken()
      setUsuario(null)
      setPermisos([])
    }
  }, [])

  const fijarUsuario = useCallback((nuevo: Usuario): void => {
    setUsuario(nuevo)
  }, [])

  const valor = useMemo<AuthContextValue>(
    () => ({
      usuario,
      permisos,
      cargando,
      tienePermiso,
      iniciarSesion,
      cerrarSesion,
      fijarUsuario,
    }),
    [usuario, permisos, cargando, tienePermiso, iniciarSesion, cerrarSesion, fijarUsuario],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)

  if (contexto === null) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }

  return contexto
}
