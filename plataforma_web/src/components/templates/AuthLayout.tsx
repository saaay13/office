import type { ReactNode } from 'react'

type Props = {
  titulo: string
  descripcion: string
  children: ReactNode
}

export function AuthLayout({ titulo, descripcion, children }: Props) {
  return (
    <div className="mesh-gradient relative flex min-h-svh flex-col overflow-hidden">
      <div className="blob -top-40 -left-40" aria-hidden="true" />
      <div className="blob -right-40 -bottom-40" aria-hidden="true" />

      <header className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 19V9m5 10V5m6 14v-7m5 7V3" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-secondary-600">Gobernación</p>
            <p className="font-semibold text-primary-700">Control de Productividad</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-xl border border-border bg-card/95 p-8 shadow-lg backdrop-blur-sm">
          <h1 className="text-2xl font-semibold text-primary-700">{titulo}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{descripcion}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>

      <footer className="relative z-10 bg-footer-bg px-6 py-4 text-center text-xs text-footer-text">
        Plataforma institucional · Acceso restringido al personal autorizado
      </footer>
    </div>
  )
}
