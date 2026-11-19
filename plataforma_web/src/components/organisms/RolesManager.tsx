import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert } from '../atoms/Alert'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { Input, Textarea } from '../atoms/Input'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
import { EmptyState } from '../molecules/EmptyState'
import { FormModal } from '../molecules/FormModal'
import { SearchField } from '../molecules/SearchField'
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

  const roles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return elementos.filter((rol) =>
      texto === '' || rol.nombre.toLowerCase().includes(texto) || rol.clave.includes(texto),
    )
  }, [elementos, busqueda])

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
        ? permisos.filter((permiso) => rol.permisos?.includes(permiso.clave)).map((permiso) => permiso.id)
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
        {tienePermiso('roles.crear') && <Button onClick={abrirNuevo}>Nuevo rol</Button>}
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && !modalAbierta && <Alert tono="error">{fallo}</Alert>}

      {cargando ? (
        <div className="rounded-lg bg-card p-10 text-center text-sm text-muted-foreground">Cargando roles...</div>
      ) : roles.length === 0 ? (
        <EmptyState titulo="Sin roles" descripcion="No se registran roles para la búsqueda actual." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Clave</th>
                <th className="px-4 py-3">Permisos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((rol) => (
                <tr key={rol.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{rol.nombre}</span>
                    {rol.es_sistema && <span className="ml-2"><Badge tono="primario">Sistema</Badge></span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-secondary-700">{rol.clave}</td>
                  <td className="px-4 py-3 text-muted-foreground">{rol.permisos?.length ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tono={rol.activo ? 'exito' : 'neutro'}>{rol.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {tienePermiso('roles.editar') && (
                        <Button variante="contorno" tamano="pequeno" onClick={() => abrirEdicion(rol)}>
                          Editar
                        </Button>
                      )}
                      {tienePermiso('roles.desactivar') && rol.activo && !rol.es_sistema && (
                        <Button variante="peligro" tamano="pequeno" onClick={() => setADesactivar(rol)}>
                          Desactivar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })}
              rows={2}
              disabled={bloqueado}
            />
            <fieldset disabled={bloqueado} className="rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-medium text-foreground">Permisos</legend>
              <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                {permisos.map((permiso) => (
                  <label key={permiso.id} className="flex items-start gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={formulario.permisos.includes(permiso.id)}
                      onChange={() => alternarPermiso(permiso.id)}
                      className="mt-0.5 size-4 rounded border-input text-primary accent-primary"
                    />
                    <span>
                      <span className="font-medium">{permiso.nombre}</span>
                      <span className="block text-xs text-muted-foreground">{permiso.modulo}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
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
