import type { ReactNode } from 'react'
import type { Tono } from './Badge'

const estilos: Record<Tono, string> = {
  neutro: 'border-line bg-app text-ink-soft',
  primario: 'border-brand-200 bg-brand-50 text-brand-800',
  secundario: 'border-brand-200 bg-brand-100 text-brand-800',
  exito: 'border-success/30 bg-success-soft text-[#166534]',
  advertencia: 'border-warning/30 bg-warning-soft text-warning',
  error: 'border-danger/30 bg-danger-soft text-danger-strong',
  info: 'border-brand-200 bg-info-soft text-brand-800',
}

export function Alert({ tono = 'info', children }: { tono?: Tono; children: ReactNode }) {
  return (
    <div
      role="status"
      className={`rounded-lg border px-3.5 py-2.5 text-[11px] font-medium ${estilos[tono]}`}
    >
      {children}
    </div>
  )
}
