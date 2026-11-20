import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Props = {
  titulo: string
  descripcion?: string
  icono?: LucideIcon
  accion?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({
  titulo,
  descripcion,
  icono: Icono,
  accion,
  children,
  className = '',
}: Props) {
  return (
    <section className={`rounded-xl border border-line bg-white p-4 shadow-sm ${className}`}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 h-4 w-1 shrink-0 rounded-full bg-brand-600" />
          <div>
            <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              {Icono && <Icono size={14} className="text-brand-700" />}
              {titulo}
            </h2>
            {descripcion && <p className="mt-0.5 text-[10px] text-muted">{descripcion}</p>}
          </div>
        </div>

        {accion && <div className="flex flex-wrap items-center gap-2">{accion}</div>}
      </header>

      {children}
    </section>
  )
}
