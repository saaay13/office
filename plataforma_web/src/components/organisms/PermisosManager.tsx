import { useMemo, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Alert, Button, EtiquetaEstado, IconoAccion, Select } from '../atoms'
import { ConfirmDialog, EmptyState, SearchField, SectionCard } from '../molecules'
import { useAuth } from '../../context/AuthContext'
import { useRecurso } from '../../hooks/useRecurso'
import {
  accionesDisponibles,
  ejecutarAccion,
  ETIQUETAS_ACCION,
  FILTROS_ESTADO,
  mensajeConfirmacion,
  mensajeExito,
  sufijoPermiso,
} from '../../services/catalogos'
import type { AccionCatalogo } from '../../services/catalogos'
import { mensajeDeError } from '../../services/errores'
import type { Permiso } from '../../types'

type Accion = { tipo: AccionCatalogo; permiso: Permiso }

export function PermisosManager() {
  const { tienePermiso } = useAuth()
  const [estado, setEstado] = useState('')
  const filtros = useMemo(() => ({ status: estado || undefined }), [estado])
  const { elementos, cargando, error, recargar } = useRecurso<Permiso>('permisos', filtros)
  const [busqueda, setBusqueda] = useState('')
  const [accion, setAccion] = useState<Accion | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')

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

  async function ejecutar(): Promise<void> {
    if (accion === null) {
      return
    }

    setProcesando(true)
    setFallo('')

    try {
      await ejecutarAccion('permisos', accion.permiso.id, accion.tipo)
      setAviso(mensajeExito(accion.tipo, 'Permiso'))
      setAccion(null)
      await recargar()
    } catch (falloAccion) {
      setFallo(mensajeDeError(falloAccion))
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchField
            valor={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar permiso o módulo"
          />
          <Select
            etiqueta="Estado"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value)}
            opciones={FILTROS_ESTADO}
            permitirVacio
            textoVacio="Todos los estados"
            className="w-36"
          />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-[10px] font-semibold text-brand-800">
          {elementos.length} permisos disponibles
        </span>
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && <Alert tono="error">{fallo}</Alert>}

      {cargando ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center text-[11px] text-muted">
          Cargando permisos...
        </div>
      ) : grupos.length === 0 ? (
        <EmptyState
          titulo="Sin permisos"
          descripcion="No hay permisos que coincidan con los filtros actuales."
        />
      ) : (
        <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
          {grupos.map(([modulo, permisos]) => (
            <SectionCard
              key={modulo}
              titulo={modulo.charAt(0).toUpperCase() + modulo.slice(1)}
              icono={KeyRound}
              accion={<span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-800">{permisos.length}</span>}
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

                    <div className="flex items-center gap-1.5">
                      <EtiquetaEstado status={permiso.status} />
                      <div className="flex gap-0.5">
                        {accionesDisponibles(permiso.status)
                          .filter((tipo) => tienePermiso(`permisos.${sufijoPermiso(tipo)}`))
                          .map((tipo) => (
                            <Button
                              key={tipo}
                              variante="fantasma"
                              tamano="icono"
                              onClick={() => setAccion({ tipo, permiso })}
                              aria-label={`${ETIQUETAS_ACCION[tipo]} ${permiso.nombre}`}
                              title={`${ETIQUETAS_ACCION[tipo]} ${permiso.nombre}`}
                            >
                              <IconoAccion nombre={tipo} />
                            </Button>
                          ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>
      )}

      {accion && (
        <ConfirmDialog
          titulo={`${ETIQUETAS_ACCION[accion.tipo]} permiso`}
          mensaje={`${mensajeConfirmacion(accion.tipo, accion.permiso.nombre)}${accion.tipo === 'eliminar' ? ' El permiso pasará a la papelera y podrá restaurarse.' : ''}${accion.tipo === 'restaurar' ? ' Volverá con estado desactivado.' : ''}`}
          confirmando={procesando}
          confirmarTexto={ETIQUETAS_ACCION[accion.tipo]}
          onConfirmar={() => void ejecutar()}
          onCancelar={() => setAccion(null)}
        />
      )}
    </div>
  )
}
