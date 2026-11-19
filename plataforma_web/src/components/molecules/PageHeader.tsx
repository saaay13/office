import type { ReactNode } from 'react'

type Props = {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}

export function PageHeader({ titulo, descripcion, acciones }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-primary-700">{titulo}</h2>
        {descripcion && <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  )
}
