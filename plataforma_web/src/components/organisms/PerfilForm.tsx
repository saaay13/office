import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert } from '../atoms/Alert'
import { Badge } from '../atoms/Badge'
import { Button } from '../atoms/Button'
import { Card } from '../atoms/Card'
import { Input } from '../atoms/Input'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { erroresDeCampo, mensajeDeError } from '../../services/errores'

export function PerfilForm() {
  const { usuario, fijarUsuario } = useAuth()
  const [nombres, setNombres] = useState(usuario?.nombres ?? '')
  const [apellidos, setApellidos] = useState(usuario?.apellidos ?? '')
  const [email, setEmail] = useState(usuario?.email ?? '')
  const [telefono, setTelefono] = useState(usuario?.telefono ?? '')
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [aviso, setAviso] = useState('')
  const [fallo, setFallo] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function guardar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setErrores({})
    setAviso('')
    setFallo('')
    setGuardando(true)

    const datos: Record<string, string | null> = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      telefono: telefono.trim() || null,
    }

    if (password !== '') {
      datos.password = password
      datos.password_confirmation = confirmacion
    }

    try {
      const respuesta = await api.perfil.actualizar(datos)

      fijarUsuario(respuesta.user)
      setAviso(respuesta.message)
      setPassword('')
      setConfirmacion('')
    } catch (falloGuardado) {
      setErrores(erroresDeCampo(falloGuardado))
      setFallo(mensajeDeError(falloGuardado))
    } finally {
      setGuardando(false)
    }
  }

  if (usuario === null) {
    return null
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary-50 text-xl font-semibold text-primary-700">
            {usuario.nombres.charAt(0)}{usuario.apellidos.charAt(0)}
          </span>
          <h3 className="mt-4 text-lg font-semibold text-foreground">{usuario.nombre_completo}</h3>
          <p className="text-sm text-muted-foreground">{usuario.usuario}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge tono="primario">{usuario.rol?.nombre ?? '—'}</Badge>
            <Badge tono="secundario">{usuario.area?.nombre ?? '—'}</Badge>
          </div>
        </div>
        <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Cargo</dt>
            <dd className="font-medium text-foreground">{usuario.cargo?.nombre ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Último acceso</dt>
            <dd className="font-medium text-foreground">
              {usuario.ultimo_acceso_at === null
                ? '—'
                : new Date(usuario.ultimo_acceso_at).toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-primary-700">Datos personales</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Actualice su información. El rol y el área se administran desde Usuarios.
        </p>

        <form onSubmit={(evento) => void guardar(evento)} className="mt-6 space-y-4" noValidate>
          {aviso && <Alert tono="exito">{aviso}</Alert>}
          {fallo && <Alert tono="error">{fallo}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              etiqueta="Nombres"
              value={nombres}
              onChange={(evento) => setNombres(evento.target.value)}
              error={errores.nombres}
              required
            />
            <Input
              etiqueta="Apellidos"
              value={apellidos}
              onChange={(evento) => setApellidos(evento.target.value)}
              error={errores.apellidos}
              required
            />
            <Input
              etiqueta="Correo institucional"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              error={errores.email}
              required
            />
            <Input
              etiqueta="Teléfono"
              value={telefono}
              onChange={(evento) => setTelefono(evento.target.value)}
              error={errores.telefono}
            />
          </div>

          <fieldset className="rounded-lg border border-border p-4">
            <legend className="px-2 text-sm font-medium text-foreground">Cambiar contraseña</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                etiqueta="Nueva contraseña"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(evento) => setPassword(evento.target.value)}
                error={errores.password}
                placeholder="Dejar vacío para mantenerla"
              />
              <Input
                etiqueta="Confirmar contraseña"
                type="password"
                autoComplete="new-password"
                value={confirmacion}
                onChange={(evento) => setConfirmacion(evento.target.value)}
              />
            </div>
          </fieldset>

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" cargando={guardando}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
