import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Alert, Button, EtiquetaEstado, IconoAccion, Input, Select } from '../atoms'
import { ConfirmDialog, FormModal, SearchField, Tabla, EmptyState } from '../molecules'
import type { ColumnaTabla } from '../molecules/Tabla'
import { useAuth } from '../../context/AuthContext'
import { useRecurso } from '../../hooks/useRecurso'
import { api } from '../../services/api'
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
import { erroresDeCampo, mensajeDeError } from '../../services/errores'
import type { Area, Cargo, Opciones, Rol, Usuario } from '../../types'

type Formulario = {
  nombres: string
  apellidos: string
  usuario: string
  email: string
  telefono: string
  rol_id: string
  area_id: string
  cargo_id: string
  password: string
  password_confirmation: string
}

type Accion = { tipo: AccionCatalogo; usuario: Usuario }

const formularioVacio: Formulario = {
  nombres: '',
  apellidos: '',
  usuario: '',
  email: '',
  telefono: '',
  rol_id: '',
  area_id: '',
  cargo_id: '',
  password: '',
  password_confirmation: '',
}

export function UsuariosManager() {
  const [parametros] = useSearchParams()
  const consulta = parametros.get('q') ?? ''
  const { usuario: usuarioActual, tienePermiso } = useAuth()
  const [estado, setEstado] = useState('')
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const [busqueda, setBusqueda] = useState(consulta)
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [accion, setAccion] = useState<Accion | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})

  const filtros = useMemo(() => ({ status: estado || undefined }), [estado])

  const { elementos, cargando, error, recargar } = useRecurso<Usuario>('usuarios', filtros)

  useEffect(() => {
    setBusqueda(consulta)
  }, [consulta])

  useEffect(() => {
    let activo = true

    async function cargarOpciones(): Promise<void> {
      try {
        const respuesta = await api.opciones()

        if (activo) {
          setOpciones(respuesta)
        }
      } catch (falloCarga) {
        if (activo) {
          setFallo(mensajeDeError(falloCarga))
        }
      }
    }

    void cargarOpciones()

    return () => {
      activo = false
    }
  }, [])

  const usuarios = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return elementos.filter(
      (usuario) =>
        texto === '' ||
        usuario.nombre_completo.toLowerCase().includes(texto) ||
        usuario.usuario.includes(texto) ||
        usuario.email.includes(texto) ||
        (usuario.area?.nombre ?? '').toLowerCase().includes(texto),
    )
  }, [elementos, busqueda])

  const cargosDisponibles = useMemo(() => {
    const cargos = opciones?.cargos ?? []

    if (editando === null || editando.cargo_id === null) {
      return cargos
    }

    if (cargos.some((cargo) => cargo.id === editando.cargo_id)) {
      return cargos
    }

    return [
      ...cargos,
      {
        id: editando.cargo_id,
        nombre: editando.cargo?.nombre ?? `Cargo #${editando.cargo_id}`,
        descripcion: null,
        status: 'desactivado' as const,
      },
    ]
  }, [editando, opciones])

  const columnas: ColumnaTabla<Usuario>[] = [
    {
      clave: 'usuario',
      nombre: 'Usuario',
      celda: (usuario) => (
        <>
          <span className="font-semibold text-ink">{usuario.nombre_completo}</span>
          <span className="mt-0.5 block text-[10px] font-normal text-muted">{usuario.usuario}</span>
        </>
      ),
    },
    {
      clave: 'area',
      nombre: 'Área',
      celda: (usuario) => (
        <span>
          {usuario.area?.codigo ? `${usuario.area.codigo} · ` : ''}
          {usuario.area?.nombre ?? '—'}
        </span>
      ),
    },
    {
      clave: 'rol',
      nombre: 'Rol',
      celda: (usuario) => <span>{usuario.rol?.nombre ?? '—'}</span>,
    },
    {
      clave: 'cargo',
      nombre: 'Cargo',
      celda: (usuario) => <span>{usuario.cargo?.nombre ?? '—'}</span>,
    },
    {
      clave: 'estado',
      nombre: 'Estado',
      celda: (usuario) => <EtiquetaEstado status={usuario.status} />,
    },
    {
      clave: 'acciones',
      nombre: 'Acciones',
      alineacion: 'derecha',
      celda: (usuario) => (
        <div className="flex justify-end gap-1.5">
          {tienePermiso('usuarios.editar') &&
            usuario.id !== usuarioActual?.id &&
            usuario.status !== 'eliminado' && (
              <Button
                variante="contorno"
                tamano="icono"
                onClick={() => abrirEdicion(usuario)}
                aria-label={`Editar ${usuario.nombre_completo}`}
                title={`Editar ${usuario.nombre_completo}`}
              >
                <IconoAccion nombre="editar" />
              </Button>
            )}

          {usuario.id !== usuarioActual?.id &&
            accionesDisponibles(usuario.status)
              .filter((tipo) => tienePermiso(`usuarios.${sufijoPermiso(tipo)}`))
              .map((tipo) => (
                <Button
                  key={tipo}
                  variante={tipo === 'activar' || tipo === 'restaurar' ? 'contorno' : 'peligroSuave'}
                  tamano="icono"
                  onClick={() => setAccion({ tipo, usuario })}
                  aria-label={`${ETIQUETAS_ACCION[tipo]} ${usuario.nombre_completo}`}
                  title={`${ETIQUETAS_ACCION[tipo]} ${usuario.nombre_completo}`}
                >
                  <IconoAccion nombre={tipo} />
                </Button>
              ))}
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

  function abrirEdicion(usuario: Usuario): void {
    setEditando(usuario)
    setFormulario({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      usuario: usuario.usuario,
      email: usuario.email,
      telefono: usuario.telefono ?? '',
      rol_id: String(usuario.rol_id),
      area_id: String(usuario.area_id),
      cargo_id: usuario.cargo_id === null ? '' : String(usuario.cargo_id),
      password: '',
      password_confirmation: '',
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

    const datos: Record<string, unknown> = {
      nombres: formulario.nombres.trim(),
      apellidos: formulario.apellidos.trim(),
      usuario: formulario.usuario.trim(),
      email: formulario.email.trim(),
      telefono: formulario.telefono.trim() || null,
      rol_id: Number(formulario.rol_id),
      area_id: Number(formulario.area_id),
      cargo_id: formulario.cargo_id === '' ? null : Number(formulario.cargo_id),
    }

    if (formulario.password !== '') {
      datos.password = formulario.password
      datos.password_confirmation = formulario.password_confirmation
    }

    try {
      if (editando === null) {
        await api.usuarios.crear(datos)
        setAviso('Usuario creado correctamente.')
      } else {
        delete datos.usuario
        await api.usuarios.actualizar(editando.id, datos)
        setAviso('Usuario actualizado correctamente.')
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
      await ejecutarAccion('usuarios', accion.usuario.id, accion.tipo)
      setAviso(mensajeExito(accion.tipo, 'Usuario'))
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
          <SearchField valor={busqueda} onChange={setBusqueda} placeholder="Buscar usuario o área" />
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

        {tienePermiso('usuarios.crear') && (
          <Button onClick={abrirNuevo}>
            <Plus size={14} />
            Nuevo usuario
          </Button>
        )}
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && !modalAbierta && <Alert tono="error">{fallo}</Alert>}

      {cargando ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center text-[11px] text-muted">
          Cargando usuarios...
        </div>
      ) : usuarios.length === 0 ? (
        <EmptyState
          titulo="Sin usuarios"
          descripcion="No se registran usuarios para los filtros actuales."
        />
      ) : (
        <Tabla
          columnas={columnas}
          datos={usuarios}
          obtenerClave={(usuario) => usuario.id}
          mensajeVacio="No se registran usuarios para los filtros actuales."
        />
      )}

      {modalAbierta && (
        <FormModal
          titulo={editando === null ? 'Nuevo usuario' : `Editar ${editando.nombre_completo}`}
          descripcion="El usuario pertenece a un área y a un rol que definen su alcance."
          onCerrar={() => setModalAbierta(false)}
        >
          <form onSubmit={(evento) => void guardar(evento)} className="space-y-4">
            {fallo && <Alert tono="error">{fallo}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                etiqueta="Nombres"
                value={formulario.nombres}
                onChange={(evento) => setFormulario({ ...formulario, nombres: evento.target.value })}
                required
              />
              <Input
                etiqueta="Apellidos"
                value={formulario.apellidos}
                onChange={(evento) =>
                  setFormulario({ ...formulario, apellidos: evento.target.value })
                }
                required
              />
              <Input
                etiqueta="Usuario"
                value={formulario.usuario}
                onChange={(evento) => setFormulario({ ...formulario, usuario: evento.target.value })}
                disabled={editando !== null}
                required
              />
              <Input
                etiqueta="Correo institucional"
                type="email"
                value={formulario.email}
                onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
                required
              />
              <Input
                etiqueta="Teléfono"
                value={formulario.telefono}
                onChange={(evento) =>
                  setFormulario({ ...formulario, telefono: evento.target.value })
                }
              />
              <Select
                etiqueta="Rol"
                value={formulario.rol_id}
                onChange={(evento) => setFormulario({ ...formulario, rol_id: evento.target.value })}
                opciones={(opciones?.roles ?? []).map((rol: Rol) => ({
                  valor: rol.id,
                  texto: rol.nombre,
                }))}
                permitirVacio
                required
              />
              <Select
                etiqueta="Área"
                value={formulario.area_id}
                onChange={(evento) => setFormulario({ ...formulario, area_id: evento.target.value })}
                opciones={(opciones?.areas ?? []).map((area: Area) => ({
                  valor: area.id,
                  texto: area.nombre,
                }))}
                permitirVacio
                required
              />
              <Select
                etiqueta="Cargo"
                value={formulario.cargo_id}
                onChange={(evento) =>
                  setFormulario({ ...formulario, cargo_id: evento.target.value })
                }
                opciones={cargosDisponibles.map((cargo: Cargo) => ({
                  valor: cargo.id,
                  texto: cargo.status === 'activo' ? cargo.nombre : `${cargo.nombre} (desactivado)`,
                }))}
                permitirVacio
                textoVacio="Sin cargo"
                error={errores.cargo_id}
              />
              <Input
                etiqueta={editando === null ? 'Contraseña' : 'Nueva contraseña (opcional)'}
                type="password"
                autoComplete="new-password"
                value={formulario.password}
                onChange={(evento) => setFormulario({ ...formulario, password: evento.target.value })}
                required={editando === null}
              />
              <Input
                etiqueta="Confirmar contraseña"
                type="password"
                autoComplete="new-password"
                value={formulario.password_confirmation}
                onChange={(evento) =>
                  setFormulario({ ...formulario, password_confirmation: evento.target.value })
                }
                required={formulario.password !== ''}
              />
            </div>

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
          titulo={`${ETIQUETAS_ACCION[accion.tipo]} usuario`}
          mensaje={`${mensajeConfirmacion(accion.tipo, accion.usuario.nombre_completo)}${accion.tipo === 'eliminar' ? ' El usuario pasará a la papelera y se cerrarán sus sesiones.' : ''}${accion.tipo === 'restaurar' ? ' Volverá con estado desactivado.' : ''}`}
          confirmando={procesando}
          confirmarTexto={ETIQUETAS_ACCION[accion.tipo]}
          onConfirmar={() => void ejecutar()}
          onCancelar={() => setAccion(null)}
        />
      )}
    </div>
  )
}
