import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  LogOut,
  Menu,
  Search,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const secciones: Record<string, string> = {
  '/': 'Inicio',
  '/areas': 'Áreas',
  '/cargos': 'Cargos',
  '/roles': 'Roles',
  '/permisos': 'Permisos',
  '/usuarios': 'Usuarios',
  '/perfil': 'Mi perfil',
}

type Props = {
  onAbrirMenu: () => void
}

export function AppHeader({ onAbrirMenu }: Props) {
  const { usuario, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const buscador = useRef<HTMLInputElement>(null)
  const [busqueda, setBusqueda] = useState('')
  const [saliendo, setSaliendo] = useState(false)

  const seccion = secciones[ubicacion.pathname] ?? 'Inicio'
  const iniciales =
    usuario === null
      ? 'US'
      : `${usuario.nombres.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase()

  const fecha = new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  useEffect(() => {
    function alPresionar(evento: KeyboardEvent): void {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k') {
        evento.preventDefault()
        buscador.current?.focus()
      }
    }

    window.addEventListener('keydown', alPresionar)

    return () => window.removeEventListener('keydown', alPresionar)
  }, [])

  function buscar(evento: FormEvent<HTMLFormElement>): void {
    evento.preventDefault()

    const texto = busqueda.trim()

    if (texto !== '') {
      navegar(`/usuarios?q=${encodeURIComponent(texto)}`)
    }
  }

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
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-white/95 px-3 backdrop-blur sm:gap-3 sm:px-5">
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-app hover:text-ink lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="hidden min-w-0 items-center gap-1.5 text-[10px] text-muted sm:flex">
        <span className="flex items-center gap-1">
          <Building2 size={12} />
          Gobernación
        </span>
        <ChevronRight size={11} className="text-line-strong" />
        <span className="truncate font-semibold text-ink">{seccion}</span>
      </div>

      <form onSubmit={buscar} className="ml-auto flex h-8 w-full max-w-[250px] items-center gap-2 rounded-md bg-[#f1f5fb] px-2.5">
        <Search size={13} className="shrink-0 text-muted" aria-hidden="true" />

        <input
          ref={buscador}
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar usuario..."
          aria-label="Buscar usuario"
          className="w-full min-w-0 bg-transparent text-[10px] text-ink-soft outline-none placeholder:text-muted-soft"
        />

        <kbd className="hidden shrink-0 rounded bg-white px-1.5 py-0.5 text-[8px] font-medium text-muted sm:block">
          Ctrl K
        </kbd>
      </form>

      <div className="hidden h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#f1f5fb] px-2.5 text-[9px] font-medium text-[#34445a] xl:flex">
        <CalendarDays size={12} />
        {fecha}
      </div>

      <button
        type="button"
        aria-label="Notificaciones"
        title="Sin notificaciones pendientes"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-app hover:text-brand-700"
      >
        <Bell size={15} />
      </button>

      <div className="hidden items-center gap-2 border-l border-line pl-3 md:flex">
        <div className="text-right">
          <p className="max-w-[140px] truncate text-[10px] font-semibold text-ink">
            {usuario?.nombre_completo ?? 'Usuario'}
          </p>
          <p className="max-w-[140px] truncate text-[8px] text-muted">
            {usuario?.rol?.nombre ?? 'Sin rol'}
          </p>
        </div>

        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white">
          {iniciales}
        </div>
      </div>

      <button
        type="button"
        onClick={() => void salir()}
        disabled={saliendo}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-danger-soft hover:text-danger-strong disabled:opacity-50"
      >
        <LogOut size={15} />
      </button>
    </header>
  )
}
