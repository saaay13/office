import { useCallback, useEffect, useState } from 'react'
import type { ParametrosConsulta } from '../types'
import { api } from '../services/api'

type Recurso = 'areas' | 'cargos' | 'roles' | 'permisos' | 'usuarios'

export function useRecurso<T>(recurso: Recurso, parametros?: ParametrosConsulta) {
  const [elementos, setElementos] = useState<T[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const clave = JSON.stringify(parametros ?? {})

  const recargar = useCallback(async (): Promise<void> => {
    setCargando(true)
    setError('')

    try {
      const datos = await api[recurso].listar(JSON.parse(clave) as ParametrosConsulta)
      setElementos(datos as T[])
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudieron cargar los datos.')
    } finally {
      setCargando(false)
    }
  }, [recurso, clave])

  useEffect(() => {
    void recargar()
  }, [recargar])

  return { elementos, setElementos, cargando, error, recargar }
}
