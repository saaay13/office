import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
        required
      />
      <Input
        etiqueta="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        value={confirmacion}
        onChange={(evento) => setConfirmacion(evento.target.value)}
        placeholder="Repita la nueva contraseña"
        required
      />

      {exito ? (
        <Link to="/ingresar" className="block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary-700">
          Ir al ingreso
        </Link>
      ) : (
        <Button type="submit" className="w-full" cargando={enviando}>
          Actualizar contraseña
        </Button>
      )}
    </form>
  )
}
