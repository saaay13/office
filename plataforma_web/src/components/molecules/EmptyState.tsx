import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string
  descripcion: string
  accion?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong bg-white px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Inbox size={20} aria-hidden="true" />
      </span>

      <div>
        <p className="text-sm font-semibold text-ink">{titulo}</p>
        <p className="mt-1 text-[11px] text-muted">{descripcion}</p>
      </div>

      {accion}
    </div>
  )
}
