import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Alert,Badge,Button,IconoAccion,Input,Select,Textarea } from '../atoms'
import { ConfirmDialog,FormModal,SearchField,Tabla } from '../molecules'
import type { ColumnaTabla } from '../molecules'
import { useAuth } from '../../context/AuthContext'
import { useRecurso } from '../../hooks/useRecurso'
import { api } from '../../services/api'
import { erroresDeCampo, mensajeDeError } from '../../services/errores'
import type { Cargo } from '../../types'

type Formulario = { nombre: string; descripcion: string }

const formularioVacio: Formulario = { nombre: '', descripcion: '' }

const estados = [
  { valor: 'activos', texto: 'Activos' },
  { valor: 'inactivos', texto: 'Inactivos' },
]

export function CargosManager() {
  const { tienePermiso } = useAuth()
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [estado, setEstado] = useState('')
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)
  const [editando, setEditando] = useState<Cargo | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [aDesactivar, setADesactivar] = useState<Cargo | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [desactivando, setDesactivando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})

  useEffect(() => {
    const temporizador = globalThis.setTimeout(() => {
      setBusquedaAplicada(busqueda.trim())
    }, 250)

    return () => globalThis.clearTimeout(temporizador)
  }, [busqueda])

  const filtros = useMemo(
    () => ({
      q: busquedaAplicada || undefined,
      activo: estado === '' ? undefined : estado === 'activos',
    }),
    [busquedaAplicada, estado],
  )

  const { elementos, cargando, error, recargar } = useRecurso<Cargo>('cargos', filtros)

  const columnas: ColumnaTabla<Cargo>[] = [
    {
      clave: 'nombre',
      nombre: 'Nombre',
      celda: (cargo) => <span className="font-semibold text-ink">{cargo.nombre}</span>,
    },
    {
      clave: 'descripcion',
      nombre: 'Descripción',
      celda: (cargo) => <span>{cargo.descripcion ?? '—'}</span>,
    },
    {
      clave: 'estado',
      nombre: 'Estado',
      celda: (cargo) => (
        <Badge tono={cargo.activo ? 'exito' : 'neutro'}>{cargo.activo ? 'Activo' : 'Inactivo'}</Badge>
      ),
    },
    {
      clave: 'acciones',
      nombre: 'Acciones',
      alineacion: 'derecha',
      celda: (cargo) => (
        <div className="flex justify-end gap-1.5">
          {tienePermiso('cargos.editar') && (
            <Button
              variante="contorno"
              tamano="icono"
              onClick={() => abrirEdicion(cargo)}
              aria-label={`Editar ${cargo.nombre}`}
              title={`Editar ${cargo.nombre}`}
            >
              <IconoAccion nombre="editar" />
            </Button>
          )}
          {tienePermiso('cargos.desactivar') && cargo.activo && (
            <Button
              variante="peligroSuave"
              tamano="icono"
              onClick={() => setADesactivar(cargo)}
              aria-label={`Desactivar ${cargo.nombre}`}
              title={`Desactivar ${cargo.nombre}`}
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
    setErrores({})
    setFallo('')
    setModalAbierta(true)
  }

  function abrirEdicion(cargo: Cargo): void {
    setEditando(cargo)
    setFormulario({ nombre: cargo.nombre, descripcion: cargo.descripcion ?? '' })
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
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
    }

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
      setErrores(erroresDeCampo(falloGuardado))
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
        <div className="flex flex-wrap items-center gap-2">
          <SearchField valor={busqueda} onChange={setBusqueda} placeholder="Buscar cargo" />
          <Select
            etiqueta="Estado"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value)}
            opciones={estados}
            permitirVacio
            textoVacio="Todos los estados"
            className="w-36"
          />
        </div>

        {tienePermiso('cargos.crear') && (
          <Button onClick={abrirNuevo}>
            <Plus size={14} />
            Nuevo cargo
          </Button>
        )}
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && !modalAbierta && <Alert tono="error">{fallo}</Alert>}

      {cargando ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center text-[11px] text-muted">
          Cargando cargos...
        </div>
      ) : (
        <Tabla
          columnas={columnas}
          datos={elementos}
          obtenerClave={(cargo) => cargo.id}
          mensajeVacio="No se registran cargos para los filtros actuales."
        />
      )}

      {modalAbierta && (
        <FormModal
          titulo={editando === null ? 'Nuevo cargo' : `Editar ${editando.nombre}`}
          descripcion="Defina el nombre y la descripción del cargo institucional."
          onCerrar={() => setModalAbierta(false)}
        >
          <form onSubmit={(evento) => void guardar(evento)} className="space-y-4">
            {fallo && <Alert tono="error">{fallo}</Alert>}

            <Input
              etiqueta="Nombre"
              value={formulario.nombre}
              onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              error={errores.nombre}
              pista="El nombre debe ser único, sin distinguir mayúsculas."
              required
            />

            <Textarea
              etiqueta="Descripción"
              value={formulario.descripcion}
              onChange={(evento) =>
                setFormulario({ ...formulario, descripcion: evento.target.value })
              }
              error={errores.descripcion}
              rows={3}
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
          titulo="Desactivar cargo"
          mensaje={`¿Desactivar el cargo "${aDesactivar.nombre}"? Los usuarios que lo tengan asignado conservarán el cargo, pero no se podrá asignar a otros usuarios.`}
          confirmando={desactivando}
          onConfirmar={() => void desactivar()}
          onCancelar={() => setADesactivar(null)}
        />
      )}
    </div>
  )
}
