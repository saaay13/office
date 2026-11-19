import { useMemo, useState } from 'react'
import { Alert } from '../atoms/Alert'
import { Badge } from '../atoms/Badge'
import { EmptyState } from '../molecules/EmptyState'
import { SearchField } from '../molecules/SearchField'
import { useRecurso } from '../../hooks/useRecurso'
import type { Permiso } from '../../types'

export function PermisosManager() {
  const { elementos, cargando, error } = useRecurso<Permiso>('permisos')
  const [busqueda, setBusqueda] = useState('')

  const grupos = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    const filtrados = elementos.filter((permiso) =>
      texto === '' ||
      permiso.nombre.toLowerCase().includes(texto) ||
      permiso.clave.includes(texto) ||
      permiso.modulo.includes(texto),
    )

    return Object.entries(
      filtrados.reduce<Record<string, Permiso[]>>((acumulado, permiso) => {
        acumulado[permiso.modulo] = [...(acumulado[permiso.modulo] ?? []), permiso]
        return acumulado
      }, {}),
    ).sort(([moduloA], [moduloB]) => moduloA.localeCompare(moduloB))
  }, [elementos, busqueda])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField valor={busqueda} onChange={setBusqueda} placeholder="Buscar permiso o módulo" />
        <Badge tono="info">{elementos.length} permisos disponibles</Badge>
      </div>

      {error && <Alert tono="error">{error}</Alert>}

      {cargando ? (
        <div className="rounded-lg bg-card p-10 text-center text-sm text-muted-foreground">Cargando permisos...</div>
      ) : grupos.length === 0 ? (
        <EmptyState titulo="Sin permisos" descripcion="No hay permisos que coincidan con la búsqueda." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {grupos.map(([modulo, permisos]) => (
            <section key={modulo} className="rounded-lg border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="font-semibold capitalize text-primary-700">{modulo}</h3>
                <Badge tono="secundario">{permisos.length}</Badge>
              </div>
              <ul className="divide-y divide-border">
                {permisos.map((permiso) => (
                  <li key={permiso.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{permiso.nombre}</p>
                      <p className="font-mono text-xs text-muted-foreground">{permiso.clave}</p>
                    </div>
                    <Badge tono={permiso.activo ? 'exito' : 'neutro'}>
                      {permiso.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
