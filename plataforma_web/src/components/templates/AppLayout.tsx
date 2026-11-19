import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function AppLayout({ children }: Props) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-secondary-600">
              Gobernación
            </p>
            <h1 className="text-lg font-semibold text-primary-700">
              Control de Productividad
            </h1>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            MVP
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
