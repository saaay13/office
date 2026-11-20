import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { List, Network, Plus } from 'lucide-react'
import { Alert, Button, EtiquetaEstado, IconoAccion, Input, Select, Textarea } from '../atoms'
import { ConfirmDialog, FormModal, SearchField, Tabla } from '../molecules'
import type { ColumnaTabla } from '../molecules'
import { ArbolAreas } from './ArbolAreas'
import { useAuth } from '../../context/AuthContext'
import { useRecurso } from '../../hooks/useRecurso'
import { api } from '../../services/api'
import {
  accionesDisponibles,
  ejecutarAccion,
  ETIQUETAS_ACCION,
  mensajeConfirmacion,
  mensajeExito,
  sufijoPermiso,
} from '../../services/catalogos'
import type { AccionCatalogo } from '../../services/catalogos'
import { erroresDeCampo, mensajeDeError } from '../../services/errores'
import type { Area, Usuario } from '../../types'

type Formulario = {
  codigo: string
  nombre: string
  padre_id: string
  tipo: string
  responsable_id: string
  email: string
  telefono: string
}

type Accion = { tipo: AccionCatalogo; area: Area }

const formularioVacio: Formulario = {
  codigo: '',
  nombre: '',
  padre_id: '',
  tipo: '',
  responsable_id: '',
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

const estados = [
  { valor: 'activo', texto: 'Activas' },
  { valor: 'desactivado', texto: 'Desactivadas' },
  { valor: 'eliminado', texto: 'Papelera' },
]

export function AreasManager() {
  const { tienePermiso, usuario } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [estado, setEstado] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [vista, setVista] = useState<'tabla' | 'arbol'>('tabla')
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)
  const [editando, setEditando] = useState<Area | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [accion, setAccion] = useState<Accion | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [responsables, setResponsables] = useState<Usuario[]>([])
  const [falloResponsables, setFalloResponsables] = useState('')

  useEffect(() => {
    const temporizador = globalThis.setTimeout(() => {
      setBusquedaAplicada(busqueda.trim())
    }, 250)

    return () => globalThis.clearTimeout(temporizador)
  }, [busqueda])

  const filtros = useMemo(
    () => ({
      q: busquedaAplicada || undefined,
      status: estado || undefined,
      tipo: tipoFiltro || undefined,
    }),
    [busquedaAplicada, estado, tipoFiltro],
  )

  const { elementos, cargando, error, recargar } = useRecurso<Area>('areas', filtros)

  useEffect(() => {
    if (!tienePermiso('usuarios.ver')) {
      return
    }

    let activo = true

    api.usuarios
      .listar()
      .then((datos) => {
        if (activo) {
          setResponsables(datos.filter((registro) => registro.status === 'activo'))
        }
      })
      .catch((falloCarga: unknown) => {
        if (activo) {
          setFalloResponsables(mensajeDeError(falloCarga))
        }
      })

    return () => {
      activo = false
    }
  }, [tienePermiso])

  const descendientes = useMemo(() => {
    const ids = new Set<number>()

    if (editando === null) {
      return ids
    }

    ids.add(editando.id)
    let cambio = true

    while (cambio) {
      cambio = false

      elementos.forEach((area) => {
        if (area.padre_id !== null && ids.has(area.padre_id) && !ids.has(area.id)) {
          ids.add(area.id)
          cambio = true
        }
      })
    }

    return ids
  }, [editando, elementos])

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
      celda: (area) => <EtiquetaEstado status={area.status} femenino />,
    },
    {
      clave: 'acciones',
      nombre: 'Acciones',
      alineacion: 'derecha',
      celda: (area) => (
        <div className="flex justify-end gap-1.5">
          {tienePermiso('areas.editar') && area.status !== 'eliminado' && (
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
          {accionesDisponibles(area.status)
            .filter((tipo) => tienePermiso(`areas.${sufijoPermiso(tipo)}`))
            .map((tipo) => (
              <Button
                key={tipo}
                variante={tipo === 'activar' || tipo === 'restaurar' ? 'contorno' : 'peligroSuave'}
                tamano="icono"
                onClick={() => setAccion({ tipo, area })}
                aria-label={`${ETIQUETAS_ACCION[tipo]} ${area.nombre}`}
                title={`${ETIQUETAS_ACCION[tipo]} ${area.nombre}`}
              >
                <IconoAccion nombre={tipo} />
              </Button>
            ))}
        </div>
      ),
    },
  ]

  function abrirNueva(): void {
    setEditando(null)
    setFormulario(formularioVacio)
    setErrores({})
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
      responsable_id: area.responsable_id === null || area.responsable_id === undefined
        ? ''
        : String(area.responsable_id),
      email: area.email ?? '',
      telefono: area.telefono ?? '',
    })
    setErrores({})
    setFallo('')
    setModalAbierta(true)
  }

  async function guardar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setGuardando(true)
    setFallo('')
    setErrores({})

    const datos = {
      codigo: formulario.codigo.trim().toUpperCase() || null,
      nombre: formulario.nombre.trim(),
      padre_id: formulario.padre_id === '' ? null : Number(formulario.padre_id),
      tipo: formulario.tipo || null,
      responsable_id: formulario.responsable_id === '' ? null : Number(formulario.responsable_id),
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
      setErrores(erroresDeCampo(falloGuardado))
    } finally {
      setGuardando(false)
    }
  }

  async function ejecutar(): Promise<void> {
    if (accion === null) {
      return
    }

    setProcesando(true)
    setFallo('')

    try {
      await ejecutarAccion('areas', accion.area.id, accion.tipo)
      setAviso(mensajeExito(accion.tipo, 'Área', true))
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-start gap-2">
          <SearchField
            valor={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar área o sigla"
          />
          <Select
            etiqueta="Estado"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value)}
            opciones={estados}
            permitirVacio
            textoVacio="Todos los estados"
            className="w-36"
          />
          <Select
            etiqueta="Tipo"
            value={tipoFiltro}
            onChange={(evento) => setTipoFiltro(evento.target.value)}
            opciones={tipos}
            permitirVacio
            textoVacio="Todos los tipos"
            className="w-36"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-line bg-white p-0.5">
            <Button
              variante={vista === 'tabla' ? 'secundario' : 'fantasma'}
              tamano="pequeno"
              onClick={() => setVista('tabla')}
              aria-label="Vista de tabla"
            >
              <List size={14} />
              Tabla
            </Button>
            <Button
              variante={vista === 'arbol' ? 'secundario' : 'fantasma'}
              tamano="pequeno"
              onClick={() => setVista('arbol')}
              aria-label="Vista de árbol"
            >
              <Network size={14} />
              Árbol
            </Button>
          </div>

          {tienePermiso('areas.crear') && (
            <Button onClick={abrirNueva}>
              <Plus size={14} />
              Nueva área
            </Button>
          )}
        </div>
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
      ) : vista === 'tabla' ? (
        <Tabla
          columnas={columnas}
          datos={elementos}
          obtenerClave={(area) => area.id}
          mensajeVacio="No hay áreas disponibles para su usuario."
        />
      ) : (
        <ArbolAreas
          areas={elementos}
          puedeEditar={tienePermiso('areas.editar')}
          puede={(tipo) => tienePermiso(`areas.${sufijoPermiso(tipo)}`)}
          onEditar={abrirEdicion}
          onAccion={(tipo, area) => setAccion({ tipo, area })}
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
            {falloResponsables && <Alert tono="error">{falloResponsables}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                etiqueta="Nombre"
                value={formulario.nombre}
                onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
                error={errores.nombre}
                required
              />
              <Input
                etiqueta="Sigla"
                value={formulario.codigo}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    codigo: evento.target.value.toUpperCase(),
                  })
                }
                placeholder="Ej. GAA"
                maxLength={20}
                error={errores.codigo}
                pista="Hasta 20 caracteres: mayúsculas, números, - o _."
                disabled={editando !== null}
                required={editando === null}
              />
              <Select
                etiqueta="Área padre"
                value={formulario.padre_id}
                onChange={(evento) => setFormulario({ ...formulario, padre_id: evento.target.value })}
                opciones={elementos
                  .filter((area) => area.status === 'activo' && !descendientes.has(area.id))
                  .map((area) => ({ valor: area.id, texto: area.nombre }))}
                permitirVacio
                textoVacio="Ninguna (raíz)"
                error={errores.padre_id}
              />
              <Select
                etiqueta="Tipo"
                value={formulario.tipo}
                onChange={(evento) => setFormulario({ ...formulario, tipo: evento.target.value })}
                opciones={tipos}
                permitirVacio
                textoVacio="Sin tipo"
                error={errores.tipo}
              />
              {tienePermiso('usuarios.ver') && (
                <Select
                  etiqueta="Responsable"
                  value={formulario.responsable_id}
                  onChange={(evento) =>
                    setFormulario({ ...formulario, responsable_id: evento.target.value })
                  }
                  opciones={responsables.map((registro) => ({
                    valor: registro.id,
                    texto: registro.nombre_completo,
                  }))}
                  permitirVacio
                  textoVacio="Sin responsable"
                  error={errores.responsable_id}
                />
              )}
              <Input
                etiqueta="Correo del área"
                type="email"
                value={formulario.email}
                onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
                error={errores.email}
              />
              <Input
                etiqueta="Teléfono"
                value={formulario.telefono}
                onChange={(evento) => setFormulario({ ...formulario, telefono: evento.target.value })}
                error={errores.telefono}
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

      {accion && (
        <ConfirmDialog
          titulo={`${ETIQUETAS_ACCION[accion.tipo]} área`}
          mensaje={`${mensajeConfirmacion(accion.tipo, accion.area.nombre)}${accion.tipo === 'eliminar' ? ' El área pasará a la papelera y podrá restaurarse.' : ''}${accion.tipo === 'restaurar' ? ' Volverá con estado desactivado.' : ''}`}
          confirmando={procesando}
          confirmarTexto={ETIQUETAS_ACCION[accion.tipo]}
          onConfirmar={() => void ejecutar()}
          onCancelar={() => setAccion(null)}
        />
      )}
    </div>
  )
}
