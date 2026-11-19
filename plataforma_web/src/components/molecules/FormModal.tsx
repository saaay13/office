import type { ReactNode } from 'react'

type Props = {
  titulo: string
  descripcion?: string
  onCerrar: () => void
  children: ReactNode
}

export function FormModal({ titulo, descripcion, onCerrar, children }: Props) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-neutral-950/60 p-4 py-10" role="presentation">
      <div role="dialog" aria-modal="true" aria-label={titulo} className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-primary-700">{titulo}</h3>
            {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
