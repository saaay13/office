import type { LucideIcon } from 'lucide-react'

export type TonoIndicador = 'azul' | 'verde' | 'naranja' | 'rojo'

const tonos: Record<
  TonoIndicador,
  { borde: string; icono: string; etiqueta: string; texto: string }
> = {
  azul: {
    borde: 'border-l-brand-600',
    icono: 'bg-info-soft text-brand-700',
    etiqueta: 'bg-brand-50 text-brand-700',
    texto: 'text-brand-700',
  },
  verde: {
    borde: 'border-l-success',
    icono: 'bg-success-soft text-[#166534]',
    etiqueta: 'bg-success-soft text-[#166534]',
    texto: 'text-[#166534]',
  },
  naranja: {
    borde: 'border-l-[#f59e0b]',
    icono: 'bg-warning-soft text-warning',
    etiqueta: 'bg-warning-soft text-warning',
    texto: 'text-warning',
  },
  rojo: {
    borde: 'border-l-danger',
    icono: 'bg-danger-soft text-danger-strong',
    etiqueta: 'bg-danger-soft text-danger-strong',
    texto: 'text-danger-strong',
  },
}

type Props = {
  titulo: string
  valor: string
  detalle: string
  subtitulo: string
  icono: LucideIcon
  tono?: TonoIndicador
}

export function StatCard({ titulo, valor, detalle, subtitulo, icono: Icono, tono = 'azul' }: Props) {
  const estilo = tonos[tono]

  return (
    <article
      className={`relative min-w-0 rounded-xl border border-line border-l-4 ${estilo.borde} bg-white p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[9px] font-bold tracking-[0.12em] ${estilo.texto}`}>{titulo}</p>
          <h2 className="mt-1.5 text-[28px] leading-none font-semibold text-ink">{valor}</h2>
        </div>

        <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${estilo.icono}`}>
          <Icono size={17} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${estilo.etiqueta}`}>
          {detalle}
        </span>
        <span className="text-[9px] text-muted">{subtitulo}</span>
      </div>
    </article>
  )
}
