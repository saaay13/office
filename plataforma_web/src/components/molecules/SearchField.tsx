type Props = {
  valor: string
  onChange: (valor: string) => void
  placeholder?: string
}

export function SearchField({ valor, onChange, placeholder = 'Buscar...' }: Props) {
  return (
    <div className="relative w-full max-w-xs">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-md border border-input bg-card py-2 pr-3 pl-9 text-sm outline-none transition placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  )
}
