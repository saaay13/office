import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader,AppSidebar } from '../organisms'

export function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const anio = new Date().getFullYear()

  return (
    <div className="flex min-h-svh flex-col bg-app text-ink">
      <AppSidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="flex min-h-svh flex-col lg:pl-[232px]">
        <AppHeader onAbrirMenu={() => setMenuAbierto(true)} />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-7">
          <div className="mx-auto max-w-[1500px] space-y-5">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-line bg-white px-6 py-3">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-2 text-[9px] text-muted">
            <span>Gobernación Departamental · Plataforma de Control de Productividad</span>
            <span className="flex items-center gap-1 font-semibold text-brand-700">
              <span className="size-1.5 rounded-full bg-brand-500" />
              Servicio activo · {anio}
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
