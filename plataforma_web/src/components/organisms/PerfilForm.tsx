import { useState } from 'react'
import type { FormEvent } from 'react'
import { Clock, KeyRound, ShieldCheck } from 'lucide-react'
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
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.5fr]">
      <Card className="self-start">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-950 text-xl font-semibold text-white shadow-md shadow-brand-900/20">
            {usuario.nombres.charAt(0)}
            {usuario.apellidos.charAt(0)}
          </span>

          <h3 className="mt-4 text-base font-semibold text-ink">{usuario.nombre_completo}</h3>
          <p className="text-[11px] text-muted">@{usuario.usuario}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            <Badge tono="primario">
              <ShieldCheck size={10} />
              {usuario.rol?.nombre ?? 'Sin rol'}
            </Badge>
            <Badge tono="secundario">{usuario.area?.nombre ?? 'Sin área'}</Badge>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-line pt-4 text-[11px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Cargo</dt>
            <dd className="text-right font-semibold text-ink">{usuario.cargo?.nombre ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Área</dt>
            <dd className="text-right font-semibold text-ink">{usuario.area?.nombre ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="flex items-center gap-1 text-muted">
              <Clock size={11} />
              Último acceso
            </dt>
            <dd className="text-right font-semibold text-ink">
              {usuario.ultimo_acceso_at === null
                ? '—'
                : new Date(usuario.ultimo_acceso_at).toLocaleString('es-BO', {
                    timeZone: 'America/La_Paz',
                  })}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-ink">Datos personales</h3>
          <p className="mt-1 text-[11px] text-muted">
            Actualice su información. El rol y el área se administran desde Usuarios.
          </p>
        </div>

        <form onSubmit={(evento) => void guardar(evento)} className="space-y-5" noValidate>
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

          <fieldset className="rounded-lg border border-line bg-app/40 p-4">
            <legend className="flex items-center gap-1.5 px-2 text-[11px] font-semibold text-ink-soft">
              <KeyRound size={12} className="text-brand-700" />
              Cambiar contraseña
            </legend>

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
                placeholder="Repita la nueva contraseña"
              />
            </div>
          </fieldset>

          <div className="flex justify-end border-t border-line pt-4">
            <Button type="submit" cargando={guardando}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
