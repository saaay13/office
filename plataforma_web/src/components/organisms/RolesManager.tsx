import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Alert } from '../atoms/Alert'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { IconoAccion } from '../atoms/IconoAccion'
import { Input, Textarea } from '../atoms/Input'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
import { EmptyState } from '../molecules/EmptyState'
import { FormModal } from '../molecules/FormModal'
import { SearchField } from '../molecules/SearchField'
import { Tabla } from '../molecules/Tabla'
import type { ColumnaTabla } from '../molecules/Tabla'
import { useAuth } from '../../context/AuthContext'
import { useRecurso } from '../../hooks/useRecurso'
import { api } from '../../services/api'
import { mensajeDeError } from '../../services/errores'
import type { Permiso, Rol } from '../../types'

type Formulario = { clave: string; nombre: string; descripcion: string; permisos: number[] }

const formularioVacio: Formulario = { clave: '', nombre: '', descripcion: '', permisos: [] }

export function RolesManager() {
  const { elementos, cargando, error, recargar } = useRecurso<Rol>('roles')
  const { tienePermiso } = useAuth()
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)
  const [editando, setEditando] = useState<Rol | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [aDesactivar, setADesactivar] = useState<Rol | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [desactivando, setDesactivando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarPermisos(): Promise<void> {
      try {
        const respuesta = await api.opciones()

        if (activo) {
          setPermisos(respuesta.permisos)
        }
      } catch {
        if (activo) {
          setFallo('No se pudieron cargar los permisos disponibles.')
        }
      }
    }

    void cargarPermisos()

    return () => {
      activo = false
    }
  }, [])

  const permisosPorModulo = useMemo(() => {
    return Array.from(
      permisos.reduce<Map<string, Permiso[]>>((grupos, permiso) => {
        const lista = grupos.get(permiso.modulo) ?? []
        lista.push(permiso)
        grupos.set(permiso.modulo, lista)
        return grupos
      }, new Map()),
    ).sort(([moduloA], [moduloB]) => moduloA.localeCompare(moduloB))
  }, [permisos])

  const roles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return elementos.filter(
      (rol) =>
        texto === '' || rol.nombre.toLowerCase().includes(texto) || rol.clave.includes(texto),
    )
  }, [elementos, busqueda])

  const columnas: ColumnaTabla<Rol>[] = [
    {
      clave: 'rol',
      nombre: 'Rol',
      celda: (rol) => (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-ink">{rol.nombre}</span>
          {rol.es_sistema && <Badge tono="primario">Sistema</Badge>}
        </span>
      ),
    },
    {
      clave: 'clave',
      nombre: 'Clave',
      celda: (rol) => <span className="font-mono text-[11px] text-brand-700">{rol.clave}</span>,
    },
    {
      clave: 'permisos',
      nombre: 'Permisos',
      celda: (rol) => <span>{rol.permisos?.length ?? '—'}</span>,
    },
    {
      clave: 'estado',
      nombre: 'Estado',
      celda: (rol) => (
        <Badge tono={rol.activo ? 'exito' : 'neutro'}>{rol.activo ? 'Activo' : 'Inactivo'}</Badge>
      ),
    },
    {
      clave: 'acciones',
      nombre: 'Acciones',
      alineacion: 'derecha',
      celda: (rol) => (
        <div className="flex justify-end gap-1.5">
          {tienePermiso('roles.editar') && (
            <Button
              variante="contorno"
              tamano="icono"
              onClick={() => abrirEdicion(rol)}
              aria-label={`Editar ${rol.nombre}`}
              title={`Editar ${rol.nombre}`}
            >
              <IconoAccion nombre="editar" />
            </Button>
          )}
          {tienePermiso('roles.desactivar') && rol.activo && !rol.es_sistema && (
            <Button
              variante="peligroSuave"
              tamano="icono"
              onClick={() => setADesactivar(rol)}
              aria-label={`Desactivar ${rol.nombre}`}
              title={`Desactivar ${rol.nombre}`}
            >
              <IconoAccion nombre="desactivar" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  function abrirNuevo(): void {
    setEditando(null)
    setFormulario(formularioVacio)
    setFallo('')
    setModalAbierta(true)
  }

  function abrirEdicion(rol: Rol): void {
    setEditando(rol)
    setFormulario({
      clave: rol.clave,
      nombre: rol.nombre,
      descripcion: rol.descripcion ?? '',
      permisos: rol.permisos
        ? permisos
            .filter((permiso) => rol.permisos?.includes(permiso.clave))
            .map((permiso) => permiso.id)
        : [],
    })
    setFallo('')
    setModalAbierta(true)
  }

  function alternarPermiso(id: number): void {
    setFormulario((actual) => ({
      ...actual,
      permisos: actual.permisos.includes(id)
        ? actual.permisos.filter((permiso) => permiso !== id)
        : [...actual.permisos, id],
    }))
  }

  async function guardar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setGuardando(true)
    setFallo('')

    try {
      if (editando === null) {
        await api.roles.crear({
          clave: formulario.clave.trim(),
          nombre: formulario.nombre.trim(),
          descripcion: formulario.descripcion.trim() || null,
          permisos: formulario.permisos,
        })
        setAviso('Rol creado correctamente.')
      } else {
        await api.roles.actualizar(editando.id, {
          nombre: formulario.nombre.trim(),
          descripcion: formulario.descripcion.trim() || null,
          permisos: formulario.permisos,
        })
        setAviso('Rol actualizado correctamente.')
      }

      setModalAbierta(false)
      await recargar()
    } catch (falloGuardado) {
      setFallo(mensajeDeError(falloGuardado))
    } finally {
      setGuardando(false)
    }
  }

  async function desactivar(): Promise<void> {
    if (aDesactivar === null) {
      return
    }

    setDesactivando(true)
    setFallo('')

    try {
      await api.roles.desactivar(aDesactivar.id)
      setAviso('Rol desactivado correctamente.')
      setADesactivar(null)
      await recargar()
    } catch (falloDesactivacion) {
      setFallo(mensajeDeError(falloDesactivacion))
    } finally {
      setDesactivando(false)
    }
  }

  const bloqueado = editando?.es_sistema ?? false

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField valor={busqueda} onChange={setBusqueda} placeholder="Buscar rol" />

        {tienePermiso('roles.crear') && (
          <Button onClick={abrirNuevo}>
            <Plus size={14} />
            Nuevo rol
          </Button>
        )}
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && !modalAbierta && <Alert tono="error">{fallo}</Alert>}

      {cargando ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center text-[11px] text-muted">
          Cargando roles...
        </div>
      ) : roles.length === 0 ? (
        <EmptyState
          titulo="Sin roles"
          descripcion="No se registran roles para la búsqueda actual."
        />
      ) : (
        <Tabla
          columnas={columnas}
          datos={roles}
          obtenerClave={(rol) => rol.id}
          mensajeVacio="No se registran roles para la búsqueda actual."
        />
      )}

      {modalAbierta && (
        <FormModal
          titulo={editando === null ? 'Nuevo rol' : `Editar ${editando.nombre}`}
          descripcion="Seleccione las acciones que el rol podrá ejecutar."
          onCerrar={() => setModalAbierta(false)}
        >
          <form onSubmit={(evento) => void guardar(evento)} className="space-y-4">
            {fallo && <Alert tono="error">{fallo}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                etiqueta="Clave"
                value={formulario.clave}
                onChange={(evento) => setFormulario({ ...formulario, clave: evento.target.value })}
                disabled={editando !== null || bloqueado}
                required
              />
              <Input
                etiqueta="Nombre"
                value={formulario.nombre}
                onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
                disabled={bloqueado}
                required
              />
            </div>

            <Textarea
              etiqueta="Descripción"
              value={formulario.descripcion}
              onChange={(evento) =>
                setFormulario({ ...formulario, descripcion: evento.target.value })
              }
              rows={2}
              disabled={bloqueado}
            />

            <fieldset disabled={bloqueado} className="rounded-lg border border-line bg-app/50 p-4">
              <legend className="px-2 text-[11px] font-semibold text-ink-soft">
                Permisos · {formulario.permisos.length} seleccionados
              </legend>

              <div className="app-scroll max-h-60 space-y-4 overflow-y-auto pr-1">
                {permisosPorModulo.map(([modulo, lista]) => (
                  <div key={modulo}>
                    <p className="mb-2 text-[9px] font-bold tracking-[0.12em] text-brand-700 uppercase">
                      {modulo}
                    </p>

                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {lista.map((permiso) => (
                        <label
                          key={permiso.id}
                          className="flex cursor-pointer items-start gap-2 rounded-md bg-white px-2.5 py-2 text-[11px] text-ink-soft transition hover:bg-brand-50"
                        >
                          <input
                            type="checkbox"
                            checked={formulario.permisos.includes(permiso.id)}
                            onChange={() => alternarPermiso(permiso.id)}
                            className="mt-0.5 size-3.5 rounded border-line-strong accent-brand-700"
                          />
                          <span className="min-w-0">
                            <span className="block font-medium">{permiso.nombre}</span>
                            <span className="block truncate font-mono text-[9px] text-muted">
                              {permiso.clave}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variante="contorno" onClick={() => setModalAbierta(false)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando} disabled={bloqueado}>
                Guardar
              </Button>
            </div>
          </form>
        </FormModal>
      )}

      {aDesactivar && (
        <ConfirmDialog
          titulo="Desactivar rol"
          mensaje={`¿Desactivar el rol "${aDesactivar.nombre}"?`}
          confirmando={desactivando}
          onConfirmar={() => void desactivar()}
          onCancelar={() => setADesactivar(null)}
        />
      )}
    </div>
  )
}
