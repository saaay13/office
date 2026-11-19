import { Outlet } from 'react-router-dom'
import { AppHeader } from '../organisms/AppHeader'
import { AppSidebar } from '../organisms/AppSidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <AppHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <AppSidebar />
        <main className="premium-scroll min-w-0 flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <footer className="bg-footer-bg px-6 py-3 text-center text-xs text-footer-text">
        Gobernación Departamental · Plataforma de Control de Productividad
      </footer>
    </div>
  )
}
