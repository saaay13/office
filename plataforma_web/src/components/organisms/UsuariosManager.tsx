import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert } from '../atoms/Alert'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { Input, Select } from '../atoms/Input'
import { ConfirmDialog } from '../molecules/ConfirmDialog'
import { EmptyState } from '../molecules/EmptyState'
import { FormModal } from '../molecules/FormModal'
import { SearchField } from '../molecules/SearchField'
import { useAuth } from '../../context/AuthContext'
import { useRecurso } from '../../hooks/useRecurso'
import { api } from '../../services/api'
import { mensajeDeError } from '../../services/errores'
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
  const { usuario: usuarioActual } = useAuth()
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [modalAbierta, setModalAbierta] = useState(false)
  const [aDesactivar, setADesactivar] = useState<Usuario | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [desactivando, setDesactivando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')

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

    return elementos.filter((usuario) =>
      texto === '' ||
      usuario.nombre_completo.toLowerCase().includes(texto) ||
      usuario.usuario.includes(texto) ||
      usuario.email.includes(texto) ||
      (usuario.area?.nombre ?? '').toLowerCase().includes(texto),
    )
  }, [elementos, busqueda])

  function abrirNuevo(): void {
    setEditando(null)
    setFormulario(formularioVacio)
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
    setFallo('')
    setModalAbierta(true)
  }

  async function guardar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setGuardando(true)
    setFallo('')

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
        <Button onClick={abrirNuevo}>Nuevo usuario</Button>
      </div>

      {aviso && <Alert tono="exito">{aviso}</Alert>}
      {error && <Alert tono="error">{error}</Alert>}
      {fallo && !modalAbierta && <Alert tono="error">{fallo}</Alert>}

      {cargando ? (
        <div className="rounded-lg bg-card p-10 text-center text-sm text-muted-foreground">Cargando usuarios...</div>
      ) : usuarios.length === 0 ? (
        <EmptyState titulo="Sin usuarios" descripcion="No se registran usuarios para la búsqueda actual." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-4xl text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Cargo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{usuario.nombre_completo}</span>
                    <span className="block text-xs text-muted-foreground">{usuario.usuario}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{usuario.area?.codigo ?? '—'} · {usuario.area?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{usuario.rol?.nombre ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{usuario.cargo?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge tono={usuario.activo ? 'exito' : 'neutro'}>{usuario.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variante="contorno" tamano="pequeno" onClick={() => abrirEdicion(usuario)}>
                        Editar
                      </Button>
                      {usuario.activo && usuario.id !== usuarioActual?.id && (
                        <Button variante="peligro" tamano="pequeno" onClick={() => setADesactivar(usuario)}>
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
                onChange={(evento) => setFormulario({ ...formulario, apellidos: evento.target.value })}
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
                onChange={(evento) => setFormulario({ ...formulario, telefono: evento.target.value })}
              />
              <Select
                etiqueta="Rol"
                value={formulario.rol_id}
                onChange={(evento) => setFormulario({ ...formulario, rol_id: evento.target.value })}
                opciones={(opciones?.roles ?? []).map((rol: Rol) => ({ valor: rol.id, texto: rol.nombre }))}
                permitirVacio
                required
              />
              <Select
                etiqueta="Área"
                value={formulario.area_id}
                onChange={(evento) => setFormulario({ ...formulario, area_id: evento.target.value })}
                opciones={(opciones?.areas ?? []).map((area: Area) => ({ valor: area.id, texto: area.nombre }))}
                permitirVacio
                required
              />
              <Select
                etiqueta="Cargo"
                value={formulario.cargo_id}
                onChange={(evento) => setFormulario({ ...formulario, cargo_id: evento.target.value })}
                opciones={(opciones?.cargos ?? []).map((cargo: Cargo) => ({ valor: cargo.id, texto: cargo.nombre }))}
                permitirVacio
                textoVacio="Sin cargo"
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
                onChange={(evento) => setFormulario({ ...formulario, password_confirmation: evento.target.value })}
                required={formulario.password !== ''}
              />
            </div>
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
