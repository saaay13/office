import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, Mail } from 'lucide-react'
import { Alert } from '../atoms/Alert'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { api } from '../../services/api'
import { erroresDeCampo, mensajeDeError } from '../../services/errores'

export function ResetPasswordForm() {
  const [parametros] = useSearchParams()
  const [correo, setCorreo] = useState(parametros.get('email') ?? '')
  const [clave, setClave] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const token = parametros.get('token') ?? ''

  async function enviar(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault()
    setErrores({})
    setMensaje('')

    if (token === '') {
      setMensaje('El enlace de recuperación no es válido. Solicite uno nuevo.')
      return
    }

    setEnviando(true)

    try {
      const respuesta = await api.auth.resetPassword(correo.trim(), token, clave)
      setMensaje(respuesta.message)
    } catch (fallo) {
      setErrores(erroresDeCampo(fallo))
      setMensaje(mensajeDeError(fallo))
    } finally {
      setEnviando(false)
    }
  }

  const exito = mensaje.includes('Contraseña actualizada')

  return (
    <form onSubmit={(evento) => void enviar(evento)} className="space-y-4" noValidate>
      {mensaje && <Alert tono={exito ? 'exito' : 'error'}>{mensaje}</Alert>}

      <Input
        etiqueta="Correo institucional"
        type="email"
        autoComplete="email"
        value={correo}
        onChange={(evento) => setCorreo(evento.target.value)}
        error={errores.email}
        prefijo={<Mail size={14} />}
        required
      />

      <Input
        etiqueta="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        value={clave}
        onChange={(evento) => setClave(evento.target.value)}
        error={errores.password}
        pista="Mínimo 8 caracteres"
        prefijo={<LockKeyhole size={14} />}
        required
      />

      <Input
        etiqueta="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        value={confirmacion}
        onChange={(evento) => setConfirmacion(evento.target.value)}
        placeholder="Repita la nueva contraseña"
        prefijo={<KeyRound size={14} />}
        required
      />

      {exito ? (
        <Link
          to="/ingresar"
          className="flex h-[42px] w-full items-center justify-center gap-1.5 rounded-md bg-brand-700 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-800"
        >
          Ir al ingreso
          <ArrowRight size={14} />
        </Link>
      ) : (
        <Button type="submit" className="h-[42px] w-full text-xs" cargando={enviando}>
          Actualizar contraseña
          <ArrowRight size={14} />
        </Button>
      )}

      <Link
        to="/ingresar"
        className="flex items-center justify-center gap-1.5 pt-1 text-[10px] font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft size={13} />
        Volver al ingreso
      </Link>
    </form>
  )
}
