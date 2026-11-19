import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'contorno' | 'peligro'
type Tamano = 'normal' | 'pequeno'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
  children: ReactNode
}

const estilosVariante: Record<Variante, string> = {
  primario: 'bg-primary text-primary-foreground hover:bg-primary-700 focus-visible:ring-primary',
  secundario: 'bg-secondary text-secondary-foreground hover:bg-secondary-600 focus-visible:ring-secondary',
  contorno: 'border border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring',
  peligro: 'bg-error text-error-foreground hover:bg-error-dark focus-visible:ring-error',
}

const estilosTamano: Record<Tamano, string> = {
  normal: 'px-4 py-2 text-sm',
  pequeno: 'px-3 py-1.5 text-xs',
}

export function Button({
  variante = 'primario',
  tamano = 'normal',
  cargando = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...resto
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${estilosVariante[variante]} ${estilosTamano[tamano]} ${className}`}
      {...resto}
    >
      {cargando && <Spinner pequeno />}
      {children}
    </button>
  )
}

function Spinner({ pequeno = false }: { pequeno?: boolean }) {
  return (
    <span
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${pequeno ? 'size-3' : 'size-5'}`}
      aria-hidden="true"
    />
  )
}

export { Spinner }
