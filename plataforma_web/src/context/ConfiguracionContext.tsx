import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { puedeConfigurar } from '../config/navegacion'
import { useAuth } from './AuthContext'

type ConfiguracionContextValue = {
  modoActivo: boolean
  autorizado: boolean
  activar: () => void
  desactivar: () => void
  alternar: () => void
}

const ConfiguracionContext = createContext<ConfiguracionContextValue | null>(null)

export function ConfiguracionProvider({ children }: { children: ReactNode }) {
  const { usuario, tienePermiso } = useAuth()
  const [modoActivo, setModoActivo] = useState(false)
  const autorizado = puedeConfigurar(tienePermiso)

  useEffect(() => {
    setModoActivo(false)
  }, [usuario?.id])

  useEffect(() => {
    if (!autorizado) {
      setModoActivo(false)
    }
  }, [autorizado])

  const activar = useCallback(() => {
    if (autorizado) {
      setModoActivo(true)
    }
  }, [autorizado])

  const desactivar = useCallback(() => {
    setModoActivo(false)
  }, [])

  const alternar = useCallback(() => {
    if (autorizado) {
      setModoActivo((activo) => !activo)
    }
  }, [autorizado])

  const valor = useMemo(
    () => ({ modoActivo, autorizado, activar, desactivar, alternar }),
    [modoActivo, autorizado, activar, desactivar, alternar],
  )

  return <ConfiguracionContext.Provider value={valor}>{children}</ConfiguracionContext.Provider>
}

export function useConfiguracion(): ConfiguracionContextValue {
  const contexto = useContext(ConfiguracionContext)

  if (contexto === null) {
    throw new Error('useConfiguracion debe usarse dentro de ConfiguracionProvider')
  }

  return contexto
}
