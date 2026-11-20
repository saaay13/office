import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

type Props = {
  titulo: string
  descripcion?: string
  etiqueta?: string
  icono?: LucideIcon
  acciones?: ReactNode
}

export function PageHeader({
  titulo,
  descripcion,
  etiqueta = 'MÓDULO INSTITUCIONAL',
  icono: Icono,
  acciones,
}: Props) {
  return (
    <section className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-[#eef3ff] via-[#eff5ff] to-[#dceaff] p-5 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white shadow-md shadow-brand-700/20">
          {Icono ? <Icono size={22} /> : <span className="text-sm font-bold">G</span>}
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-[9px] font-bold tracking-[0.18em] text-brand-700">{etiqueta}</p>
          <h1 className="text-xl leading-tight font-semibold tracking-tight text-brand-950 sm:text-2xl">
            {titulo}
          </h1>
          {descripcion && (
            <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-muted">{descripcion}</p>
          )}
        </div>
      </div>

      {acciones && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{acciones}</div>}
    </section>
  )
}
