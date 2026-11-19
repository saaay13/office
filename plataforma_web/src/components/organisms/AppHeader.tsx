import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { useAuth } from '../../context/AuthContext'

export function AppHeader() {
  const { usuario, cerrarSesion } = useAuth()
  const [saliendo, setSaliendo] = useState(false)
  const navegar = useNavigate()

  async function salir(): Promise<void> {
    setSaliendo(true)

    try {
      await cerrarSesion()
      navegar('/ingresar', { replace: true })
    } finally {
      setSaliendo(false)
    }
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 19V9m5 10V5m6 14v-7m5 7V3" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-secondary-600">Gobernación</p>
            <p className="text-sm font-semibold text-primary-700">Control de Productividad</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{usuario?.nombre_completo}</p>
            <p className="text-xs text-muted-foreground">
              {usuario?.area?.codigo ?? '—'} · {usuario?.rol?.nombre ?? '—'}
            </p>
          </div>
          <Badge tono="secundario">{usuario?.activo ? 'Activo' : 'Inactivo'}</Badge>
          <Button variante="contorno" tamano="pequeno" onClick={() => void salir()} cargando={saliendo}>
            Salir
          </Button>
        </div>
      </div>
    </header>
  )
}
