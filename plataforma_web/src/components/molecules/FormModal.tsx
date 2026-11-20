import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  titulo: string
  descripcion?: string
  onCerrar: () => void
  children: ReactNode
}

export function FormModal({ titulo, descripcion, onCerrar, children }: Props) {
  useEffect(() => {
    function alPresionar(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') {
        onCerrar()
      }
    }

    window.addEventListener('keydown', alPresionar)

    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4 backdrop-blur-sm sm:py-10"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-xl border border-line bg-white shadow-[0_24px_60px_rgba(11,42,70,0.25)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="mb-1 text-[9px] font-bold tracking-[0.16em] text-brand-700">
              REGISTRO INSTITUCIONAL
            </p>
            <h3 className="text-base font-semibold text-ink">{titulo}</h3>
            {descripcion && <p className="mt-1 text-[11px] text-muted">{descripcion}</p>}
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-app hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="app-scroll max-h-[calc(100svh-11rem)] overflow-y-auto px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
