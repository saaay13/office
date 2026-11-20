import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'contorno' | 'fantasma' | 'peligro' | 'peligroSuave'
type Tamano = 'normal' | 'pequeno' | 'icono'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
  children: ReactNode
}

const estilosVariante: Record<Variante, string> = {
  primario:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 focus-visible:ring-brand-300',
  secundario:
    'bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-200',
  contorno:
    'border border-line bg-white text-ink-soft hover:border-line-strong hover:bg-app focus-visible:ring-brand-200',
  fantasma:
    'text-muted hover:bg-app hover:text-ink focus-visible:ring-brand-200',
  peligro:
    'bg-danger text-white shadow-sm hover:bg-danger-strong focus-visible:ring-red-300',
  peligroSuave:
    'border border-line bg-white text-danger hover:border-danger/40 hover:bg-danger-soft focus-visible:ring-red-200',
}

const estilosTamano: Record<Tamano, string> = {
  normal: 'h-9 px-3.5 text-xs',
  pequeno: 'h-7 px-2.5 text-[11px]',
  icono: 'size-8',
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
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${estilosVariante[variante]} ${estilosTamano[tamano]} ${className}`}
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
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${
        pequeno ? 'size-3' : 'size-5'
      }`}
      aria-hidden="true"
    />
  )
}

export { Spinner }
