import { useMemo, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Alert,Badge } from '../atoms'
import { EmptyState,SearchField,SectionCard  } from '../molecules'
import { useRecurso } from '../../hooks/useRecurso'
import type { Permiso } from '../../types'

export function PermisosManager() {
  const { elementos, cargando, error } = useRecurso<Permiso>('permisos')
  const [busqueda, setBusqueda] = useState('')

  const grupos = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    const filtrados = elementos.filter(
      (permiso) =>
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
        <SearchField
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar permiso o módulo"
        />

        <Badge tono="info">{elementos.length} permisos disponibles</Badge>
      </div>

      {error && <Alert tono="error">{error}</Alert>}

      {cargando ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center text-[11px] text-muted">
          Cargando permisos...
        </div>
      ) : grupos.length === 0 ? (
        <EmptyState
          titulo="Sin permisos"
          descripcion="No hay permisos que coincidan con la búsqueda."
        />
      ) : (
        <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
          {grupos.map(([modulo, permisos]) => (
            <SectionCard
              key={modulo}
              titulo={modulo.charAt(0).toUpperCase() + modulo.slice(1)}
              icono={KeyRound}
              accion={<Badge tono="secundario">{permisos.length}</Badge>}
              className="mb-4 break-inside-avoid"
            >
              <ul className="divide-y divide-line">
                {permisos.map((permiso) => (
                  <li
                    key={permiso.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-ink">{permiso.nombre}</p>
                      <p className="mt-0.5 font-mono text-[9px] text-muted">{permiso.clave}</p>
                    </div>

                    <Badge tono={permiso.activo ? 'exito' : 'neutro'}>
                      {permiso.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}
