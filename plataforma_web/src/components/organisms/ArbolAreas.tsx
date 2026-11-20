import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { IconoAccion } from '../atoms/IconoAccion'
import { EmptyState } from '../molecules/EmptyState'
import type { Area } from '../../types'

type Nodo = Area & { hijos: Nodo[] }

type Props = {
  areas: Area[]
  puedeEditar: boolean
  puedeDesactivar: boolean
  onEditar: (area: Area) => void
  onDesactivar: (area: Area) => void
}

function construirArbol(areas: Area[]): Nodo[] {
  const porId = new Map(areas.map((area) => [area.id, area]))
  const nodos = new Map<number, Nodo>(
    areas.map((area) => [area.id, { ...area, hijos: [] }]),
  )
  const hijosPorPadre = new Map<number, Nodo[]>()

  areas.forEach((area) => {
    if (area.padre_id === null || !porId.has(area.padre_id) || area.padre_id === area.id) {
      return
    }

    const hijos = hijosPorPadre.get(area.padre_id) ?? []
    const nodo = nodos.get(area.id)

    if (nodo) {
      hijos.push(nodo)
      hijosPorPadre.set(area.padre_id, hijos)
    }
  })

  nodos.forEach((nodo) => {
    nodo.hijos = hijosPorPadre.get(nodo.id) ?? []
  })

  return [...nodos.values()]
    .filter(
      (nodo) =>
        nodo.padre_id === null || !porId.has(nodo.padre_id) || nodo.padre_id === nodo.id,
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

type FilaProps = {
  nodo: Nodo
  nivel: number
  contraidos: Set<number>
  onAlternar: (id: number) => void
  puedeEditar: boolean
  puedeDesactivar: boolean
  onEditar: (area: Area) => void
  onDesactivar: (area: Area) => void
}

function FilaArbol({
  nodo,
  nivel,
  contraidos,
  onAlternar,
  puedeEditar,
  puedeDesactivar,
  onEditar,
  onDesactivar,
}: FilaProps) {
  const contraido = contraidos.has(nodo.id)

  return (
    <li role="treeitem" aria-expanded={nodo.hijos.length > 0 ? !contraido : undefined}>
      <div
        className="flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-app"
        style={{ paddingLeft: `${nivel * 20 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => onAlternar(nodo.id)}
          disabled={nodo.hijos.length === 0}
          aria-label={contraido ? `Expandir ${nodo.nombre}` : `Contraer ${nodo.nombre}`}
          className="flex size-5 shrink-0 items-center justify-center rounded text-muted transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-default disabled:opacity-0"
        >
          {contraido ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        <span className="font-mono text-[10px] text-brand-700">{nodo.codigo ?? '—'}</span>
        <span className="text-xs font-semibold text-ink">{nodo.nombre}</span>
        <Badge tono="neutro">{nodo.tipo ?? 'Sin tipo'}</Badge>
        <span className="text-[10px] text-muted">Nivel {nodo.nivel ?? '—'}</span>
        <span className="text-[10px] text-muted">
          {nodo.responsable?.nombre ?? 'Sin responsable'}
        </span>
        <Badge tono={nodo.activo ? 'exito' : 'neutro'}>
          {nodo.activo ? 'Activa' : 'Inactiva'}
        </Badge>

        <div className="ml-auto flex gap-1">
          {puedeEditar && (
            <Button
              variante="fantasma"
              tamano="icono"
              onClick={() => onEditar(nodo)}
              aria-label={`Editar ${nodo.nombre}`}
              title={`Editar ${nodo.nombre}`}
            >
              <IconoAccion nombre="editar" />
            </Button>
          )}
          {puedeDesactivar && nodo.activo && (
            <Button
              variante="fantasma"
              tamano="icono"
              onClick={() => onDesactivar(nodo)}
              aria-label={`Desactivar ${nodo.nombre}`}
              title={`Desactivar ${nodo.nombre}`}
            >
              <IconoAccion nombre="desactivar" />
            </Button>
          )}
        </div>
      </div>

      {!contraido && nodo.hijos.length > 0 && (
        <ul role="group">
          {nodo.hijos.map((hijo) => (
            <FilaArbol
              key={hijo.id}
              nodo={hijo}
              nivel={nivel + 1}
              contraidos={contraidos}
              onAlternar={onAlternar}
              puedeEditar={puedeEditar}
              puedeDesactivar={puedeDesactivar}
              onEditar={onEditar}
              onDesactivar={onDesactivar}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function ArbolAreas({
  areas,
  puedeEditar,
  puedeDesactivar,
  onEditar,
  onDesactivar,
}: Props) {
  const [contraidos, setContraidos] = useState<Set<number>>(new Set())
  const nodos = useMemo(() => construirArbol(areas), [areas])

  function alternar(id: number): void {
    setContraidos((actuales) => {
      const siguientes = new Set(actuales)

      if (siguientes.has(id)) {
        siguientes.delete(id)
      } else {
        siguientes.add(id)
      }

      return siguientes
    })
  }

  if (nodos.length === 0) {
    return (
      <EmptyState
        titulo="Sin áreas para mostrar"
        descripcion="Ajuste los filtros o la búsqueda para ver la estructura organizacional."
      />
    )
  }

  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <ul role="tree" className="space-y-0.5">
        {nodos.map((nodo) => (
          <FilaArbol
            key={nodo.id}
            nodo={nodo}
            nivel={0}
            contraidos={contraidos}
            onAlternar={alternar}
            puedeEditar={puedeEditar}
            puedeDesactivar={puedeDesactivar}
            onEditar={onEditar}
            onDesactivar={onDesactivar}
          />
        ))}
      </ul>
    </div>
  )
}
