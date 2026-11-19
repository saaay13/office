import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type Enlace = {
  ruta: string
  texto: string
  permiso?: string
  icono: string
}

const enlaces: Enlace[] = [
  { ruta: '/', texto: 'Inicio', icono: 'inicio' },
  { ruta: '/areas', texto: 'Áreas', permiso: 'areas.ver', icono: 'areas' },
  { ruta: '/cargos', texto: 'Cargos', permiso: 'cargos.ver', icono: 'cargos' },
  { ruta: '/roles', texto: 'Roles', permiso: 'roles.ver', icono: 'roles' },
  { ruta: '/permisos', texto: 'Permisos', permiso: 'permisos.ver', icono: 'permisos' },
  { ruta: '/usuarios', texto: 'Usuarios', permiso: 'usuarios.ver', icono: 'usuarios' },
  { ruta: '/perfil', texto: 'Mi perfil', icono: 'perfil' },
]

function Icono({ nombre }: { nombre: string }) {
  const trazos: Record<string, string> = {
    inicio: 'M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    areas: 'M4 5h16v5H4zm0 9h7v5H4zm11 0h5v5h-5z',
    cargos: 'M4 7h16M4 12h11M4 17h7',
    roles: 'M12 3 4 6v5c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z',
    permisos: 'M6 10V7a6 6 0 0 1 12 0v3M5 10h14v10H5z',
    usuarios: 'M16 19v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M17 11a3 3 0 1 0-2-5.2M21 19v-1a4 4 0 0 0-3-3.9',
    perfil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0',
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d={trazos[nombre] ?? trazos.inicio} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AppSidebar() {
  const { tienePermiso } = useAuth()
  const visibles = enlaces.filter((enlace) => !enlace.permiso || tienePermiso(enlace.permiso))

  return (
    <nav aria-label="Navegación principal" className="premium-scroll overflow-x-auto border-b border-border bg-card md:w-60 md:shrink-0 md:overflow-visible md:border-r md:border-b-0">
      <div className="flex gap-1 p-2 md:flex-col md:p-4">
        {visibles.map((enlace) => (
          <NavLink
            key={enlace.ruta}
            to={enlace.ruta}
            end={enlace.ruta === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Icono nombre={enlace.icono} />
            {enlace.texto}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
