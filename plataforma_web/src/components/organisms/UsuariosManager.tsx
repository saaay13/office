import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Alert,Badge,Button,IconoAccion,Input,Select } from '../atoms'
import { ConfirmDialog,FormModal,SearchField,Tabla,EmptyState } from '../molecules'
import type { ColumnaTabla } from '../molecules/Tabla'
import { useAuth } from '../../context/AuthContext'
import { useRecurso } from '../../hooks/useRecurso'
import { api } from '../../services/api'
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
  const { elementos, cargando, error, recargar } = useRecurso<Usuario>('usuarios')
  const { usuario: usuarioActual, tienePermiso } = useAuth()
  const [parametros] = useSearchParams()
  const consulta = parametros.get('q') ?? ''
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const [busqueda, setBusqueda] = useState(consulta)
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [aDesactivar, setADesactivar] = useState<Usuario | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [desactivando, setDesactivando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})

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
        activo: false,
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
      celda: (usuario) => (
        <Badge tono={usuario.activo ? 'exito' : 'neutro'}>
          {usuario.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      clave: 'acciones',
      nombre: 'Acciones',
      alineacion: 'derecha',
      celda: (usuario) => (
        <div className="flex justify-end gap-1.5">
          {tienePermiso('usuarios.editar') && (
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

          {tienePermiso('usuarios.desactivar') &&
            usuario.activo &&
            usuario.id !== usuarioActual?.id && (
              <Button
                variante="peligroSuave"
                tamano="icono"
                onClick={() => setADesactivar(usuario)}
                aria-label={`Desactivar ${usuario.nombre_completo}`}
                title={`Desactivar ${usuario.nombre_completo}`}
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
        await api.usuarios.crear({ ...datos, activo: true })
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

  async function desactivar(): Promise<void> {
    if (aDesactivar === null) {
      return
    }

    setDesactivando(true)
    setFallo('')

    try {
      await api.usuarios.desactivar(aDesactivar.id)
      setAviso('Usuario desactivado correctamente.')
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
        <SearchField valor={busqueda} onChange={setBusqueda} placeholder="Buscar usuario o área" />

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
          descripcion="No se registran usuarios para la búsqueda actual."
        />
      ) : (
        <Tabla
          columnas={columnas}
          datos={usuarios}
          obtenerClave={(usuario) => usuario.id}
          mensajeVacio="No se registran usuarios para la búsqueda actual."
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
                  texto: cargo.activo ? cargo.nombre : `${cargo.nombre} (inactivo)`,
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

      {aDesactivar && (
        <ConfirmDialog
          titulo="Desactivar usuario"
          mensaje={`¿Desactivar a "${aDesactivar.nombre_completo}"? Se cerrarán sus sesiones activas.`}
          confirmando={desactivando}
          onConfirmar={() => void desactivar()}
          onCancelar={() => setADesactivar(null)}
        />
      )}
    </div>
  )
}
