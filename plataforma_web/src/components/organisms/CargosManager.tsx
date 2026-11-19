import { useMemo, useState } from 'react'
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
import type { Cargo } from '../../types'

type Formulario = { nombre: string; descripcion: string }

const formularioVacio: Formulario = { nombre: '', descripcion: '' }

export function CargosManager() {
  const { elementos, cargando, error, recargar } = useRecurso<Cargo>('cargos')
  const { tienePermiso } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)
  const [editando, setEditando] = useState<Cargo | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [aDesactivar, setADesactivar] = useState<Cargo | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [desactivando, setDesactivando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')

  const cargos = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return elementos.filter((cargo) => texto === '' || cargo.nombre.toLowerCase().includes(texto))
  }, [elementos, busqueda])

  function abrirNuevo(): void {
    setEditando(null)
    setFormulario(formularioVacio)
    setFallo('')
    setModalAbierta(true)
  }

  function abrirEdicion(cargo: Cargo): void {
    setEditando(cargo)
    setFormulario({ nombre: cargo.nombre, descripcion: cargo.descripcion ?? '' })
    setFallo('')
    setModalAbierta(true)
  }

  async function guardar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setGuardando(true)
    setFallo('')

    const datos = { nombre: formulario.nombre.trim(), descripcion: formulario.descripcion.trim() || null }

    try {
      if (editando === null) {
        await api.cargos.crear(datos)
        setAviso('Cargo creado correctamente.')
      } else {
        await api.cargos.actualizar(editando.id, datos)
        setAviso('Cargo actualizado correctamente.')
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
      await api.cargos.desactivar(aDesactivar.id)
      setAviso('Cargo desactivado correctamente.')
      setADesactivar(null)
      await recargar()
    } catch (falloDesactivacion) {
      setFallo(mensajeDeError(falloDesactivacion))
    } finally {
      setDesactivando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField valor={busqueda} onChange={setBusqueda} placeholder="Buscar cargo" />
        {tienePermiso('cargos.crear') && <Button onClick={abrirNuevo}>Nuevo cargo</Button>}
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && !modalAbierta && <Alert tono="error">{fallo}</Alert>}

      {cargando ? (
        <div className="rounded-lg bg-card p-10 text-center text-sm text-muted-foreground">Cargando cargos...</div>
      ) : cargos.length === 0 ? (
        <EmptyState titulo="Sin cargos" descripcion="No se registran cargos para la búsqueda actual." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cargos.map((cargo) => (
                <tr key={cargo.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-foreground">{cargo.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cargo.descripcion ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tono={cargo.activo ? 'exito' : 'neutro'}>{cargo.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {tienePermiso('cargos.editar') && (
                        <Button variante="contorno" tamano="pequeno" onClick={() => abrirEdicion(cargo)}>
                          Editar
                        </Button>
                      )}
                      {tienePermiso('cargos.desactivar') && cargo.activo && (
                        <Button variante="peligro" tamano="pequeno" onClick={() => setADesactivar(cargo)}>
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
          titulo={editando === null ? 'Nuevo cargo' : `Editar ${editando.nombre}`}
          onCerrar={() => setModalAbierta(false)}
        >
          <form onSubmit={(evento) => void guardar(evento)} className="space-y-4">
            {fallo && <Alert tono="error">{fallo}</Alert>}
            <Input
              etiqueta="Nombre"
              value={formulario.nombre}
              onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              required
            />
            <Textarea
              etiqueta="Descripción"
              value={formulario.descripcion}
              onChange={(evento) => setFormulario({ ...formulario, descripcion: evento.target.value })}
              rows={3}
            />
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variante="contorno" onClick={() => setModalAbierta(false)}>
                Cancelar
              </Button>
              <Button type="submit" cargando={guardando}>
                Guardar
              </Button>
            </div>
          </form>
        </FormModal>
      )}

      {aDesactivar && (
        <ConfirmDialog
          titulo="Desactivar cargo"
          mensaje={`¿Desactivar el cargo "${aDesactivar.nombre}"?`}
          confirmando={desactivando}
          onConfirmar={() => void desactivar()}
          onCancelar={() => setADesactivar(null)}
        />
      )}
    </div>
  )
}
