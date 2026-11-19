import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert } from '../atoms/Alert'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { Input, Select, Textarea } from '../atoms/Input'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
import { EmptyState } from '../molecules/EmptyState'
import { FormModal } from '../molecules/FormModal'
import { SearchField } from '../molecules/SearchField'
import { useAuth } from '../../context/AuthContext'
import { useRecurso } from '../../hooks/useRecurso'
import { api } from '../../services/api'
import { mensajeDeError } from '../../services/errores'
import type { Area } from '../../types'

type Formulario = {
  codigo: string
  nombre: string
  padre_id: string
  tipo: string
  email: string
  telefono: string
}

const formularioVacio: Formulario = {
  codigo: '',
  nombre: '',
  padre_id: '',
  tipo: '',
  email: '',
  telefono: '',
}

const tipos = [
  { valor: 'despacho', texto: 'Despacho' },
  { valor: 'secretaria', texto: 'Secretaría' },
  { valor: 'direccion', texto: 'Dirección' },
  { valor: 'unidad', texto: 'Unidad' },
  { valor: 'area', texto: 'Área' },
]

export function AreasManager() {
  const { elementos, cargando, error, recargar } = useRecurso<Area>('areas')
  const { tienePermiso, usuario } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)
  const [editando, setEditando] = useState<Area | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [aDesactivar, setADesactivar] = useState<Area | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [desactivando, setDesactivando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')

  const areas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return elementos.filter((area) =>
      texto === '' ||
      area.nombre.toLowerCase().includes(texto) ||
      (area.codigo ?? '').toLowerCase().includes(texto),
    )
  }, [elementos, busqueda])

  const esAdmin = usuario?.rol?.clave === 'admin_institucional'
  const esJefe = usuario?.rol?.clave === 'jefe_area'

  function abrirNueva(): void {
    setEditando(null)
    setFormulario(formularioVacio)
    setFallo('')
    setModalAbierta(true)
  }

  function abrirEdicion(area: Area): void {
    setEditando(area)
    setFormulario({
      codigo: area.codigo ?? '',
      nombre: area.nombre,
      padre_id: area.padre_id === null ? '' : String(area.padre_id),
      tipo: area.tipo ?? '',
      email: area.email ?? '',
      telefono: area.telefono ?? '',
    })
    setFallo('')
    setModalAbierta(true)
  }

  async function guardar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setGuardando(true)
    setFallo('')

    const datos = {
      codigo: formulario.codigo.trim() || null,
      nombre: formulario.nombre.trim(),
      padre_id: formulario.padre_id === '' ? null : Number(formulario.padre_id),
      tipo: formulario.tipo || null,
      email: formulario.email.trim() || null,
      telefono: formulario.telefono.trim() || null,
    }

    try {
      if (editando === null) {
        await api.areas.crear(datos)
        setAviso('Área creada correctamente.')
      } else {
        await api.areas.actualizar(editando.id, datos)
        setAviso('Área actualizada correctamente.')
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
      await api.areas.desactivar(aDesactivar.id)
      setAviso('Área desactivada correctamente.')
      setADesactivar(null)
      await recargar()
    } catch (falloDesactivacion) {
      setFallo(mensajeDeError(falloDesactivacion))
    } finally {
      setDesactivando(false)
    }
  }

  function puedeEditar(area: Area): boolean {
    if (!tienePermiso('areas.editar')) {
      return false
    }

    return esAdmin || (esJefe && area.id === usuario?.area_id)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField valor={busqueda} onChange={setBusqueda} placeholder="Buscar área o sigla" />
        {tienePermiso('areas.crear') && (
          <Button onClick={abrirNueva}>Nueva área</Button>
        )}
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && !modalAbierta && <Alert tono="error">{fallo}</Alert>}

      {cargando ? (
        <div className="rounded-lg bg-card p-10 text-center text-sm text-muted-foreground">Cargando áreas...</div>
      ) : areas.length === 0 ? (
        <EmptyState titulo="Sin áreas" descripcion="No hay áreas disponibles para su usuario." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sigla</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {areas.map((area) => (
                <tr key={area.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-primary-600">{area.codigo ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{area.nombre}</span>
                    <span className="block text-xs text-muted-foreground">{area.padre?.nombre ?? 'Raíz'}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{area.tipo ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{area.nivel ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{area.responsable?.nombre ?? 'Sin asignar'}</td>
                  <td className="px-4 py-3">
                    <Badge tono={area.activo ? 'exito' : 'neutro'}>{area.activo ? 'Activa' : 'Inactiva'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {puedeEditar(area) && (
                        <Button variante="contorno" tamano="pequeno" onClick={() => abrirEdicion(area)}>
                          Editar
                        </Button>
                      )}
                      {esAdmin && area.activo && (
                        <Button variante="peligro" tamano="pequeno" onClick={() => setADesactivar(area)}>
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
          titulo={editando === null ? 'Nueva área' : `Editar ${editando.nombre}`}
          descripcion="La ruta y el nivel se calculan automáticamente según el área padre."
          onCerrar={() => setModalAbierta(false)}
        >
          <form onSubmit={(evento) => void guardar(evento)} className="space-y-4">
            {fallo && <Alert tono="error">{fallo}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                etiqueta="Nombre"
                value={formulario.nombre}
                onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
                required
              />
              <Input
                etiqueta="Sigla"
                value={formulario.codigo}
                onChange={(evento) => setFormulario({ ...formulario, codigo: evento.target.value })}
                placeholder="Ej. GAA"
                disabled={editando !== null}
              />
              <Select
                etiqueta="Área padre"
                value={formulario.padre_id}
                onChange={(evento) => setFormulario({ ...formulario, padre_id: evento.target.value })}
                opciones={elementos.filter((area) => area.id !== editando?.id).map((area) => ({ valor: area.id, texto: area.nombre }))}
                permitirVacio
                textoVacio="Ninguna (raíz)"
              />
              <Select
                etiqueta="Tipo"
                value={formulario.tipo}
                onChange={(evento) => setFormulario({ ...formulario, tipo: evento.target.value })}
                opciones={tipos}
                permitirVacio
                textoVacio="Sin tipo"
              />
              <Input
                etiqueta="Correo del área"
                type="email"
                value={formulario.email}
                onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
              />
              <Input
                etiqueta="Teléfono"
                value={formulario.telefono}
                onChange={(evento) => setFormulario({ ...formulario, telefono: evento.target.value })}
              />
            </div>
            <Textarea
              etiqueta="Ruta materializada"
              value={editando?.ruta ?? ''}
              readOnly
              rows={2}
              placeholder="La ruta se genera automáticamente"
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
          titulo="Desactivar área"
          mensaje={`¿Desactivar "${aDesactivar.nombre}"? No se puede desactivar un área con hijas activas.`}
          confirmando={desactivando}
          onConfirmar={() => void desactivar()}
          onCancelar={() => setADesactivar(null)}
        />
      )}
    </div>
  )
}
