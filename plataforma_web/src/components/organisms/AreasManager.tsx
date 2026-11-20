import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Alert } from '../atoms/Alert'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { IconoAccion } from '../atoms/IconoAccion'
import { Input, Select, Textarea } from '../atoms/Input'
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

    return elementos.filter(
      (area) =>
        texto === '' ||
        area.nombre.toLowerCase().includes(texto) ||
        (area.codigo ?? '').toLowerCase().includes(texto),
    )
  }, [elementos, busqueda])

  const esAdminVista = usuario?.rol?.clave === 'admin_vista'

  const columnas: ColumnaTabla<Area>[] = [
    {
      clave: 'sigla',
      nombre: 'Sigla',
      celda: (area) => <span className="font-mono text-[11px] text-brand-700">{area.codigo ?? '—'}</span>,
    },
    {
      clave: 'nombre',
      nombre: 'Nombre',
      celda: (area) => (
        <>
          <span className="font-semibold text-ink">{area.nombre}</span>
          <span className="mt-0.5 block text-[10px] font-normal text-muted">
            {area.padre?.nombre ?? 'Raíz'}
          </span>
        </>
      ),
    },
    {
      clave: 'tipo',
      nombre: 'Tipo',
      celda: (area) => <span className="capitalize">{area.tipo ?? '—'}</span>,
    },
    {
      clave: 'nivel',
      nombre: 'Nivel',
      celda: (area) => <span>{area.nivel ?? '—'}</span>,
    },
    {
      clave: 'responsable',
      nombre: 'Responsable',
      celda: (area) => <span>{area.responsable?.nombre ?? 'Sin asignar'}</span>,
    },
    {
      clave: 'estado',
      nombre: 'Estado',
      celda: (area) => (
        <Badge tono={area.activo ? 'exito' : 'neutro'}>{area.activo ? 'Activa' : 'Inactiva'}</Badge>
      ),
    },
    {
      clave: 'acciones',
      nombre: 'Acciones',
      alineacion: 'derecha',
      celda: (area) => (
        <div className="flex justify-end gap-1.5">
          {tienePermiso('areas.editar') && (
            <Button
              variante="contorno"
              tamano="icono"
              onClick={() => abrirEdicion(area)}
              aria-label={`Editar ${area.nombre}`}
              title={`Editar ${area.nombre}`}
            >
              <IconoAccion nombre="editar" />
            </Button>
          )}
          {tienePermiso('areas.desactivar') && area.activo && (
            <Button
              variante="peligroSuave"
              tamano="icono"
              onClick={() => setADesactivar(area)}
              aria-label={`Desactivar ${area.nombre}`}
              title={`Desactivar ${area.nombre}`}
            >
              <IconoAccion nombre="desactivar" />
            </Button>
          )}
        </div>
      ),
    },
  ]

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField valor={busqueda} onChange={setBusqueda} placeholder="Buscar área o sigla" />

        {tienePermiso('areas.crear') && (
          <Button onClick={abrirNueva}>
            <Plus size={14} />
            Nueva área
          </Button>
        )}
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && !modalAbierta && <Alert tono="error">{fallo}</Alert>}
      {esAdminVista && (
        <Alert tono="info">Está consultando las áreas asignadas en modo solo lectura.</Alert>
      )}

      {cargando ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center text-[11px] text-muted">
          Cargando áreas...
        </div>
      ) : areas.length === 0 ? (
        <EmptyState
          titulo="Sin áreas"
          descripcion="No hay áreas disponibles para su usuario o la búsqueda actual."
        />
      ) : (
        <Tabla
          columnas={columnas}
          datos={areas}
          obtenerClave={(area) => area.id}
          mensajeVacio="No hay áreas disponibles para su usuario."
        />
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
                opciones={elementos
                  .filter((area) => area.id !== editando?.id)
                  .map((area) => ({ valor: area.id, texto: area.nombre }))}
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

            <div className="flex justify-end gap-2 border-t border-line pt-4">
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
          mensaje={`¿Desactivar "${aDesactivar.nombre}"? No se puede desactivar un área con áreas hijas activas.`}
          confirmando={desactivando}
          onConfirmar={() => void desactivar()}
          onCancelar={() => setADesactivar(null)}
        />
      )}
    </div>
  )
}
