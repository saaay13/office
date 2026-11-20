import { NavLink } from 'react-router-dom'
import { Building2, ShieldCheck } from 'lucide-react'
import { GRUPOS_NAVEGACION, enlaceVisible } from '../../config/navegacion'
import { useAuth } from '../../context/AuthContext'
import { useConfiguracion } from '../../context/ConfiguracionContext'

type Props = {
  abierto: boolean
  onCerrar: () => void
}

export function AppSidebar({ abierto, onCerrar }: Props) {
  const { usuario, tienePermiso } = useAuth()
  const { modoActivo } = useConfiguracion()
  const contexto = { rol: usuario?.rol?.clave ?? null, tienePermiso }

  const iniciales =
    usuario === null
      ? 'US'
      : `${usuario.nombres.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase()

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-brand-950/45 backdrop-blur-[2px] transition-opacity lg:hidden ${
          abierto ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCerrar}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col bg-brand-900 text-white transition-transform duration-200 lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-3.5">
          <div className="flex size-9 items-center justify-center rounded-lg border border-[#24a8ff]/60 bg-brand-800">
            <ShieldCheck size={21} aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.08em]">GOBERNACIÓN</p>
            <p className="text-[9px] text-blue-200">Sistema de Control</p>
          </div>
        </div>

        <nav className="app-scroll flex-1 overflow-y-auto px-2.5 py-4" aria-label="Navegación principal">
          {GRUPOS_NAVEGACION.map((grupo) => {
            const visibles = grupo.enlaces.filter((enlace) => enlaceVisible(enlace, contexto))

            if (visibles.length === 0) {
              return null
            }

            return (
              <div key={grupo.titulo} className="mb-5">
                <p className="mb-1.5 px-2 text-[8px] font-semibold tracking-[0.16em] text-blue-200/75 uppercase">
                  {grupo.titulo}
                </p>

                <div className="space-y-1">
                  {visibles.map((enlace) => {
                    const subenlaces = (enlace.subenlaces ?? []).filter(
                      (subenlace) =>
                        enlaceVisible(subenlace, contexto) &&
                        (!subenlace.requiereModo || modoActivo),
                    )

                    return (
                      <div key={enlace.ruta}>
                        <NavLink
                          to={enlace.ruta}
                          end={enlace.ruta === '/'}
                          onClick={onCerrar}
                          className={({ isActive }) =>
                            `flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[11px] font-medium transition ${
                              isActive
                                ? 'bg-brand-700 text-white shadow-sm'
                                : 'text-blue-100/75 hover:bg-white/10 hover:text-white'
                            }`
                          }
                        >
                          <enlace.icono size={15} aria-hidden="true" />
                          {enlace.texto}
                        </NavLink>

                        {subenlaces.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1 border-l border-white/15 pl-2">
                            {subenlaces.map((subenlace) => (
                              <NavLink
                                key={subenlace.ruta}
                                to={subenlace.ruta}
                                onClick={onCerrar}
                                className={({ isActive }) =>
                                  `flex h-7 items-center gap-2 rounded-md px-2 text-[10px] transition ${
                                    isActive
                                      ? 'bg-brand-800 text-white'
                                      : 'text-blue-100/60 hover:bg-white/10 hover:text-white'
                                  }`
                                }
                              >
                                <subenlace.icono size={13} aria-hidden="true" />
                                {subenlace.texto}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          {usuario?.area && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-2">
              <Building2 size={13} className="shrink-0 text-blue-200" />
              <span className="truncate text-[9px] text-blue-50">{usuario.area.nombre}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold">
              {iniciales}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold">
                {usuario?.nombre_completo ?? 'Usuario'}
              </p>
              <p className="truncate text-[8px] text-blue-200">
                {usuario?.rol?.nombre ?? 'Sin rol asignado'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
