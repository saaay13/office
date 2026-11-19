import type { ReactNode } from 'react'

export type Tono = 'neutro' | 'primario' | 'secundario' | 'exito' | 'advertencia' | 'error' | 'info'

const estilos: Record<Tono, string> = {
  neutro: 'bg-neutral-100 text-neutral-700',
  primario: 'bg-primary-50 text-primary-700',
  secundario: 'bg-secondary-50 text-secondary-700',
  exito: 'bg-success/15 text-success-dark',
  advertencia: 'bg-warning/20 text-warning-dark',
  error: 'bg-error/15 text-error',
  info: 'bg-info/15 text-primary-600',
}

export function Badge({ tono = 'neutro', children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estilos[tono]}`}>
      {children}
    </span>
  )
}
