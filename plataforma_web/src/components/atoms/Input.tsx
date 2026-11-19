import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string
  error?: string
  pista?: string
}

export function Input({ etiqueta, error, pista, id, className = '', ...resto }: Props) {
  const identificador = id ?? etiqueta.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={identificador} className="text-sm font-medium text-foreground">
        {etiqueta}
      </label>
      <input
        id={identificador}
        className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary/10 ${error ? 'border-error' : 'border-input'} ${className}`}
        aria-invalid={error ? true : undefined}
        {...resto}
      />
      {pista && !error && <p className="text-xs text-muted-foreground">{pista}</p>}
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  etiqueta: string
  error?: string
  opciones: { valor: string | number; texto: string }[]
  permitirVacio?: boolean
  textoVacio?: string
}

export function Select({
  etiqueta,
  error,
  opciones,
  permitirVacio = false,
  textoVacio = 'Seleccione una opción',
  id,
  className = '',
  ...resto
}: SelectProps) {
  const identificador = id ?? etiqueta.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={identificador} className="text-sm font-medium text-foreground">
        {etiqueta}
      </label>
      <select
        id={identificador}
        className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 ${error ? 'border-error' : 'border-input'} ${className}`}
        {...resto}
      >
        {permitirVacio && <option value="">{textoVacio}</option>}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  etiqueta: string
  error?: string
}

export function Textarea({ etiqueta, error, id, className = '', ...resto }: TextareaProps) {
  const identificador = id ?? etiqueta.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={identificador} className="text-sm font-medium text-foreground">
        {etiqueta}
      </label>
      <textarea
        id={identificador}
        className={`w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary/10 ${error ? 'border-error' : 'border-input'} ${className}`}
        {...resto}
      />
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  )
}
