import type { ReactNode } from 'react'

export type Tono = 'neutro' | 'primario' | 'secundario' | 'exito' | 'advertencia' | 'error' | 'info'

const estilos: Record<Tono, string> = {
  neutro: 'bg-app text-muted',
  primario: 'bg-brand-50 text-brand-700',
  secundario: 'bg-brand-100 text-brand-800',
  exito: 'bg-success-soft text-[#166534]',
  advertencia: 'bg-warning-soft text-warning',
  error: 'bg-danger-soft text-danger-strong',
  info: 'bg-info-soft text-brand-800',
}

export function Badge({ tono = 'neutro', children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${estilos[tono]}`}
    >
      {children}
    </span>
  )
}
