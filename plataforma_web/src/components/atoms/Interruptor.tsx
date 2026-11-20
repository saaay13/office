type Props = {
  activo: boolean
  onCambiar: () => void
  etiqueta: string
  deshabilitado?: boolean
}

export function Interruptor({ activo, onCambiar, etiqueta, deshabilitado = false }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={deshabilitado}
      onClick={onCambiar}
      className={`relative h-6 w-11 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 ${
        activo ? 'bg-brand-700' : 'bg-line-strong'
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${
          activo ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}
