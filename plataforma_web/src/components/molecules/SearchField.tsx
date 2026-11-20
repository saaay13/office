import { Search } from 'lucide-react'

type Props = {
  valor: string
  onChange: (valor: string) => void
  placeholder?: string
}

export function SearchField({ valor, onChange, placeholder = 'Buscar...' }: Props) {
  return (
    <div className="relative w-full max-w-xs">
      <Search
        size={14}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-soft"
        aria-hidden="true"
      />

      <input
        type="search"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-md border border-line bg-white pr-3 pl-9 text-xs text-ink-soft outline-none transition placeholder:text-muted-soft focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10"
      />
    </div>
  )
}
