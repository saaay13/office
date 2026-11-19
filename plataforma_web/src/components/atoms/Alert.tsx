import type { ReactNode } from 'react'
import type { Tono } from './Badge'

const estilos: Record<Tono, string> = {
  neutro: 'border-border bg-muted text-foreground',
  primario: 'border-primary-200 bg-primary-50 text-primary-800',
  secundario: 'border-secondary-200 bg-secondary-50 text-secondary-800',
  exito: 'border-success/40 bg-success/10 text-success-dark',
  advertencia: 'border-warning/40 bg-warning/15 text-warning-dark',
  error: 'border-error/40 bg-error/10 text-error',
  info: 'border-info/40 bg-info/10 text-primary-700',
}

export function Alert({ tono = 'info', children }: { tono?: Tono; children: ReactNode }) {
  return (
    <div role="status" className={`rounded-md border px-4 py-3 text-sm ${estilos[tono]}`}>
      {children}
    </div>
  )
}
