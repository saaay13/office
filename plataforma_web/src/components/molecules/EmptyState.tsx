import type { ReactNode } from 'react'

export function EmptyState({ titulo, descripcion, accion }: { titulo: string; descripcion: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary-50 text-secondary-600" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h10M4 17h7" />
        </svg>
      </span>
      <div>
        <p className="font-medium text-foreground">{titulo}</p>
        <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
      </div>
      {accion}
    </div>
  )
}
