import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { ChevronDown } from 'lucide-react'

function identificadorDe(etiqueta: string, id?: string): string {
  if (id) {
    return id
  }

  return etiqueta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
}

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string
  error?: string
  pista?: string
  prefijo?: ReactNode
  sufijo?: ReactNode
}

export function Input({
  etiqueta,
  error,
  pista,
  prefijo,
  sufijo,
  id,
  className = '',
  disabled,
  ...resto
}: Props) {
  const identificador = identificadorDe(etiqueta, id)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={identificador} className="text-[11px] font-semibold text-ink-soft">
        {etiqueta}
      </label>

      <div
        className={`flex h-[42px] items-center gap-2 rounded-md border bg-white px-3 transition focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/10 ${
          error ? 'border-danger' : 'border-line'
        } ${disabled ? 'bg-app/70' : ''}`}
      >
        {prefijo && <span className="shrink-0 text-muted-soft">{prefijo}</span>}

        <input
          id={identificador}
          disabled={disabled}
          className={`w-full min-w-0 bg-transparent text-xs text-ink-soft outline-none placeholder:text-muted-soft disabled:cursor-not-allowed ${className}`}
          aria-invalid={error ? true : undefined}
          {...resto}
        />

        {sufijo && <span className="shrink-0">{sufijo}</span>}
      </div>

      {pista && !error && <p className="text-[10px] text-muted">{pista}</p>}
      {error && <p className="text-[10px] font-medium text-danger">{error}</p>}
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
  const identificador = identificadorDe(etiqueta, id)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={identificador} className="text-[11px] font-semibold text-ink-soft">
        {etiqueta}
      </label>

      <div className="relative">
        <select
          id={identificador}
          className={`h-[42px] w-full appearance-none rounded-md border bg-white px-3 pr-9 text-xs text-ink-soft outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 ${
            error ? 'border-danger' : 'border-line'
          } ${className}`}
          aria-invalid={error ? true : undefined}
          {...resto}
        >
          {permitirVacio && <option value="">{textoVacio}</option>}
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
      </div>

      {error && <p className="text-[10px] font-medium text-danger">{error}</p>}
    </div>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  etiqueta: string
  error?: string
}

export function Textarea({ etiqueta, error, id, className = '', ...resto }: TextareaProps) {
  const identificador = identificadorDe(etiqueta, id)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={identificador} className="text-[11px] font-semibold text-ink-soft">
        {etiqueta}
      </label>

      <textarea
        id={identificador}
        className={`w-full rounded-md border bg-white px-3 py-2.5 text-xs text-ink-soft outline-none transition placeholder:text-muted-soft focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 ${
          error ? 'border-danger' : 'border-line'
        } ${className}`}
        aria-invalid={error ? true : undefined}
        {...resto}
      />

      {error && <p className="text-[10px] font-medium text-danger">{error}</p>}
    </div>
  )
}
